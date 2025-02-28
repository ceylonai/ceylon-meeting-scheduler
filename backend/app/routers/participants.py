from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List

from ..database import get_db
from ..models.participant import Participant
from ..models.time_slot import TimeSlot
from ..schemas.participant import ParticipantCreate, Participant as ParticipantSchema
from ..schemas.time_slot import TimeSlotCreate, TimeSlot as TimeSlotSchema

router = APIRouter(
    prefix="/participants",
    tags=["participants"],
    responses={404: {"description": "Participant not found"}},
)

@router.post("/", response_model=ParticipantSchema)
def create_participant(participant: ParticipantCreate, db: Session = Depends(get_db)):
    try:
        db_participant = Participant(
            name=participant.name,
            email=participant.email,
            is_active=True
        )
        db.add(db_participant)
        db.commit()
        db.refresh(db_participant)
        return db_participant
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[ParticipantSchema])
def read_participants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        participants = db.query(Participant).offset(skip).limit(limit).all()
        return participants
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{participant_id}", response_model=ParticipantSchema)
def read_participant(participant_id: int, db: Session = Depends(get_db)):
    try:
        db_participant = db.query(Participant).filter(Participant.id == participant_id).first()
        if db_participant is None:
            raise HTTPException(status_code=404, detail="Participant not found")
        return db_participant
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{participant_id}", response_model=ParticipantSchema)
def update_participant(participant_id: int, participant: ParticipantCreate, db: Session = Depends(get_db)):
    try:
        db_participant = db.query(Participant).filter(Participant.id == participant_id).first()
        if db_participant is None:
            raise HTTPException(status_code=404, detail="Participant not found")
        
        db_participant.name = participant.name
        db_participant.email = participant.email
        
        db.commit()
        db.refresh(db_participant)
        return db_participant
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{participant_id}")
def delete_participant(participant_id: int, db: Session = Depends(get_db)):
    try:
        db_participant = db.query(Participant).filter(Participant.id == participant_id).first()
        if db_participant is None:
            raise HTTPException(status_code=404, detail="Participant not found")
        
        db.delete(db_participant)
        db.commit()
        return {"detail": "Participant deleted"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{participant_id}/timeslots", response_model=TimeSlotSchema)
def create_participant_timeslot(participant_id: int, timeslot: TimeSlotCreate, db: Session = Depends(get_db)):
    try:
        db_participant = db.query(Participant).filter(Participant.id == participant_id).first()
        if db_participant is None:
            raise HTTPException(status_code=404, detail="Participant not found")
        
        db_timeslot = TimeSlot(
            date=timeslot.date,
            start_time=timeslot.start_time,
            end_time=timeslot.end_time,
            participant_id=participant_id
        )
        
        db.add(db_timeslot)
        db.commit()
        db.refresh(db_timeslot)
        return db_timeslot
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{participant_id}/timeslots", response_model=List[TimeSlotSchema])
def read_participant_timeslots(participant_id: int, db: Session = Depends(get_db)):
    try:
        db_participant = db.query(Participant).filter(Participant.id == participant_id).first()
        if db_participant is None:
            raise HTTPException(status_code=404, detail="Participant not found")
        
        return db_participant.available_slots
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))