from dataclasses import dataclass, field
from typing import List, Optional
from .data_models import TimeSlot


@dataclass
class AvailabilityRequest:
    meeting_id: str
    time_slot: TimeSlot


@dataclass
class AvailabilityResponse:
    meeting_id: str
    participant: str
    time_slot: TimeSlot
    available: bool


@dataclass
class MeetingScheduled:
    meeting_id: str
    time_slot: TimeSlot
    participants: List[str]
