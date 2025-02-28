from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List

from ..database import get_db
from ..models.meeting import Meeting, MeetingParticipant, ScheduledSlot
from ..models.participant import Participant
from ..schemas.meeting import MeetingCreate, Meeting as MeetingSchema

router = APIRouter(
    prefix="/meetings",
    tags=["meetings"],
    responses={404: {"description": "Meeting not found"}},
)

@router.post("/", response_model=MeetingSchema)
def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    try:
        db_meeting = Meeting(
            name=meeting.name,
            date=meeting.date,
            duration=meeting.duration,
            minimum_participants=meeting.minimum_participants
        )
        db.add(db_meeting)
        db.commit()
        db.refresh(db_meeting)
        
        # Add participants
        for participant_id in meeting.participant_ids:
            db_participant = db.query(Participant).filter(Participant.id == participant_id).first()
            if db_participant:
                meeting_participant = MeetingParticipant(
                    meeting_id=db_meeting.id,
                    participant_id=participant_id
                )
                db.add(meeting_participant)
        
        db.commit()
        db.refresh(db_meeting)
        return db_meeting
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[MeetingSchema])
def read_meetings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        meetings = db.query(Meeting).offset(skip).limit(limit).all()
        return meetings
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{meeting_id}", response_model=MeetingSchema)
def read_meeting(meeting_id: int, db: Session = Depends(get_db)):
    try:
        db_meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if db_meeting is None:
            raise HTTPException(status_code=404, detail="Meeting not found")
        return db_meeting
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{meeting_id}", response_model=MeetingSchema)
def update_meeting(meeting_id: int, meeting: MeetingCreate, db: Session = Depends(get_db)):
    try:
        db_meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if db_meeting is None:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        db_meeting.name = meeting.name
        db_meeting.date = meeting.date
        db_meeting.duration = meeting.duration
        db_meeting.minimum_participants = meeting.minimum_participants
        
        # Update participants
        db.query(MeetingParticipant).filter(MeetingParticipant.meeting_id == meeting_id).delete()
        
        for participant_id in meeting.participant_ids:
            db_participant = db.query(Participant).filter(Participant.id == participant_id).first()
            if db_participant:
                meeting_participant = MeetingParticipant(
                    meeting_id=db_meeting.id,
                    participant_id=participant_id
                )
                db.add(meeting_participant)
        
        db.commit()
        db.refresh(db_meeting)
        return db_meeting
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    try:
        db_meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if db_meeting is None:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        # Delete related meeting participants
        db.query(MeetingParticipant).filter(MeetingParticipant.meeting_id == meeting_id).delete()
        
        # Delete the meeting
        db.delete(db_meeting)
        db.commit()
        return {"detail": "Meeting deleted"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))