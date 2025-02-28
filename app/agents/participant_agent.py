
import asyncio
from typing import List, Dict, Optional
from ceylon import BaseAgent, on, AgentDetail, PeerMode
from ..models.data_models import TimeSlot
from ..models.message_types import AvailabilityRequest, AvailabilityResponse, MeetingScheduled


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
        """Check if two time slots overlap enough for the specified duration."""
        if slot1.date != slot2.date:
            return False
            
        latest_start = max(slot1.start_time, slot2.start_time)
        earliest_end = min(slot1.end_time, slot2.end_time)
        return earliest_end - latest_start >= duration

    @on(AvailabilityRequest) 
    async def handle_request(self, request: AvailabilityRequest, 
                           time: int, agent: AgentDetail):
        """Handle availability request and respond with availability status."""
        # Check if already scheduled for this time
        for meeting_slot in self.scheduled_meetings.values():
            if self.has_overlap(meeting_slot, request.time_slot, request.time_slot.duration):
                # Already scheduled
                await self.broadcast_message(AvailabilityResponse(
                    meeting_id=request.meeting_id,
                    participant=self.name,
                    time_slot=request.time_slot,
                    available=False
                ))
                return
                
        # Check availability against personal schedule
        is_available = any(
            self.has_overlap(slot, request.time_slot, 
                           request.time_slot.duration)
            for slot in self.available_slots
        )
        
        response = AvailabilityResponse(
            meeting_id=request.meeting_id,
            participant=self.name,
            time_slot=request.time_slot,
            available=is_available
        )
        await self.broadcast_message(response)
        
    @on(MeetingScheduled)
    async def handle_scheduled(self, meeting: MeetingScheduled,
                             time: int, agent: AgentDetail):
        """Update agent's schedule when a meeting is confirmed."""
        if self.name in meeting.participants:
            self.scheduled_meetings[meeting.meeting_id] = meeting.time_slot