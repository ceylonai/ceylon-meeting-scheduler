from dataclasses import dataclass, field
from typing import List, Optional, Dict


@dataclass
class TimeSlot:
    date: str
    start_time: int
    end_time: int

    @property
    def duration(self):
        return self.end_time - self.start_time


@dataclass
class Meeting:
    name: str
    date: str
    duration: int
    minimum_participants: int


@dataclass
class MeetingOutput:
    meeting_id: str
    name: str
    scheduled: bool
    time_slot: Optional[TimeSlot] = None
    participants: List[str] = field(default_factory=list)
    error: Optional[str] = None

