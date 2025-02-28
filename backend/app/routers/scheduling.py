from typing import List

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..agents.participant_agent import ParticipantAgent, TimeSlot as AgentTimeSlot
from ..agents.scheduling_playground import SchedulingPlayground, Meeting as AgentMeeting
from ..database import get_db, SessionLocal
from ..models.meeting import Meeting, MeetingParticipant, ScheduledSlot
from ..models.participant import Participant
from ..schemas.meeting import MeetingScheduleResult

router = APIRouter(
    prefix="/scheduling",
    tags=["scheduling"],
)

@router.post("/run", response_model=List[MeetingScheduleResult])
async def run_scheduling(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Run the meeting scheduling process for all unscheduled meetings.
    Uses Ceylon's agent-based scheduling to find optimal meeting times.
    """
    try:
        # Get unscheduled meetings
        db_meetings = db.query(Meeting).filter(Meeting.scheduled_slot_id == None).all()
        
        if not db_meetings:
            return []
        
        # Convert DB meetings to agent meetings
        agent_meetings = []
        for db_meeting in db_meetings:
            agent_meeting = AgentMeeting(
                name=db_meeting.name,
                date=db_meeting.date,
                duration=db_meeting.duration,
                minimum_participants=db_meeting.minimum_participants
            )
            agent_meetings.append(agent_meeting)
        
        # Get all participants and their available slots
        participants = []
        for db_participant in db.query(Participant).filter(Participant.is_active == True).all():
            available_slots = []
            for slot in db_participant.available_slots:
                agent_slot = AgentTimeSlot(
                    date=slot.date,
                    start_time=slot.start_time,
                    end_time=slot.end_time
                )
                available_slots.append(agent_slot)
            
            participant_agent = ParticipantAgent(
                name=db_participant.name,
                available_slots=available_slots
            )
            participants.append(participant_agent)
        
        # Create playground
        playground = SchedulingPlayground(port=8455)
        
        # Run scheduling
        background_tasks.add_task(
            process_scheduling_results,
            playground, 
            agent_meetings, 
            participants, 
            db_meetings
        )
        
        return [
            MeetingScheduleResult(
                meeting_id=meeting.id,
                name=meeting.name,
                scheduled=False,
                error="Scheduling in progress"
            )
            for meeting in db_meetings
        ]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status", response_model=List[MeetingScheduleResult])
def get_scheduling_status(db: Session = Depends(get_db)):
    """Get the current status of all meetings."""
    try:
        results = []
        
        for meeting in db.query(Meeting).all():
            result = MeetingScheduleResult(
                meeting_id=meeting.id,
                name=meeting.name,
                scheduled=meeting.scheduled_slot_id is not None
            )
            
            if meeting.scheduled_slot:
                result.time_slot = meeting.scheduled_slot
                
                # Get participant IDs
                participant_ids = [
                    mp.participant_id 
                    for mp in db.query(MeetingParticipant)
                    .filter(MeetingParticipant.meeting_id == meeting.id)
                    .all()
                ]
                result.participants = participant_ids
            
            results.append(result)
        
        return results
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_scheduling_results(
    playground: SchedulingPlayground,
    agent_meetings: List[AgentMeeting],
    participants: List[ParticipantAgent],
    db_meetings: List[Meeting]
):
    """Process the results of the scheduling and update the database."""
    # Run scheduling
    results = await playground.schedule_meetings(agent_meetings, participants)
    
    # Update database with results
    db = SessionLocal()
    try:
        for i, (meeting_id, result) in enumerate(results.items()):
            db_meeting = db_meetings[i]
            
            if result.scheduled and result.time_slot:
                try:
                    # Create scheduled slot
                    db_slot = ScheduledSlot(
                        date=result.time_slot.date,
                        start_time=result.time_slot.start_time,
                        end_time=result.time_slot.end_time
                    )
                    db.add(db_slot)
                    db.commit()
                    db.refresh(db_slot)
                    
                    # Update meeting with scheduled slot
                    db_meeting.scheduled_slot_id = db_slot.id
                    db.commit()
                except SQLAlchemyError as e:
                    db.rollback()
                    raise HTTPException(status_code=500, detail="Database error occurred")
                except Exception as e:
                    db.rollback()
                    raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()