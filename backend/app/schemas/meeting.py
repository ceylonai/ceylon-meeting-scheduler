from pydantic import BaseModel
from typing import List, Optional

class ScheduledSlotBase(BaseModel):
    date: str
    start_time: int
    end_time: int

class ScheduledSlotCreate(ScheduledSlotBase):
    pass

class ScheduledSlot(ScheduledSlotBase):
    id: int
    
    class Config:
        orm_mode = True

class MeetingBase(BaseModel):
    name: str
    date: str
    duration: int
    minimum_participants: int = 2

class MeetingCreate(MeetingBase):
    participant_ids: List[int] = []

class Meeting(MeetingBase):
    id: int
    participants: List[int] = []
    scheduled_slot: Optional[ScheduledSlot] = None
    
    class Config:
        orm_mode = True

class MeetingScheduleResult(BaseModel):
    meeting_id: int
    name: str
    scheduled: bool
    time_slot: Optional[ScheduledSlot] = None
    participants: List[int] = []
    error: Optional[str] = None