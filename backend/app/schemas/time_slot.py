from pydantic import BaseModel
from typing import Optional

class TimeSlotBase(BaseModel):
    date: str
    start_time: int
    end_time: int

class TimeSlotCreate(TimeSlotBase):
    participant_id: int

class TimeSlot(TimeSlotBase):
    id: int
    participant_id: int
    
    class Config:
        orm_mode = True