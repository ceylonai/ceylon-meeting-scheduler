import logging
from fastapi import APIRouter, HTTPException
from typing import List, Dict
from ..models.data_models import TimeSlot
from ..services.scheduler_service import SchedulerService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/participants",
    tags=["participants"],
)

@router.post("/", response_model=Dict[str, str])
async def create_participant(participant: Dict):
    """Create a new participant with availability."""
    name = participant.get("name")
    slots = participant.get("available_slots", [])
    
    if not name:
        raise HTTPException(status_code=400, detail="Participant name is required")
        
    time_slots = []
    for slot in slots:
        time_slots.append(TimeSlot(
            date=slot["date"],
            start_time=slot["start_time"],
            end_time=slot["end_time"]
        ))
    
    scheduler = SchedulerService()
    participant_id = await scheduler.add_participant(name, time_slots)
    logger.info(f"Created participant {participant_id} with name {name} and {len(time_slots)} slots")
    return {"participant_id": participant_id}

@router.get("/", response_model=List[Dict])
async def get_participants():
    """Get all participants."""
    scheduler = SchedulerService()
    participants = await scheduler.get_participants()
    logger.info(f"Retrieved {len(participants)} participants")
    return [
        {
            "id": participant_id,
            "name": name,
            "available_slots": [
                {
                    "date": slot.date,
                    "start_time": slot.start_time,
                    "end_time": slot.end_time
                } for slot in slots
            ]
        }
        for participant_id, (name, slots) in participants.items()
    ]

@router.get("/{participant_id}", response_model=Dict)
async def get_participant(participant_id: str):
    """Get a specific participant by ID."""
    scheduler = SchedulerService()
    participant = await scheduler.get_participant(participant_id)
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
        
    name, slots = participant
    logger.info(f"Retrieved participant {participant_id} with name {name} and {len(slots)} slots")
    return {
        "id": participant_id,
        "name": name,
        "available_slots": [
            {
                "date": slot.date,
                "start_time": slot.start_time,
                "end_time": slot.end_time
            } for slot in slots
        ]
    }