from ceylon import BaseAgent, PeerMode, on
from dataclasses import dataclass
from typing import List, Dict, Optional
import asyncio

@dataclass
class TimeSlot:
    date: str
    start_time: int
    end_time: int
    
    @property
    def duration(self):
        return self.end_time - self.start_time

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

class ParticipantAgent(BaseAgent):
    def __init__(self, name: str, available_slots: List[TimeSlot]):
        super().__init__(
            name=name,
            mode=PeerMode.CLIENT,
            role="participant"
        )
        self.available_slots = available_slots
        self.scheduled_meetings: Dict[str, TimeSlot] = {}

    @staticmethod
    def has_overlap(slot1: TimeSlot, slot2: TimeSlot, duration: int) -> bool:
        latest_start = max(slot1.start_time, slot2.start_time)
        earliest_end = min(slot1.end_time, slot2.end_time)
        return earliest_end - latest_start >= duration

    @on(AvailabilityRequest)
    async def handle_request(self, request: AvailabilityRequest, time: int, agent):
        # Check availability and respond
        is_available = any(
            self.has_overlap(slot, request.time_slot, request.time_slot.duration)
            for slot in self.available_slots
        )
        
        response = AvailabilityResponse(
            meeting_id=request.meeting_id,
            participant=self.name,
            time_slot=request.time_slot,
            available=is_available
        )
        
        await self.broadcast_message(response)