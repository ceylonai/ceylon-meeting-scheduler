from pydantic import BaseModel, EmailStr
from typing import List, Optional
from .time_slot import TimeSlot

class ParticipantBase(BaseModel):
    name: str
    email: EmailStr

class ParticipantCreate(ParticipantBase):
    pass

class Participant(ParticipantBase):
    id: int
    is_active: bool
    available_slots: List[TimeSlot] = []
    
    class Config:
        orm_mode = True