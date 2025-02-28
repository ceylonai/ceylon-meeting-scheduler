from dataclasses import dataclass, field
from typing import List, Dict, Optional
import asyncio
import logging

from ceylon import on
from ceylon.base.playground import BasePlayGround

from .participant_agent import (
    TimeSlot, AvailabilityRequest, AvailabilityResponse, MeetingScheduled, 
    ParticipantAgent
)

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

logger = logging.getLogger("ceylon")

class SchedulingPlayground(BasePlayGround):
    def __init__(self, name="meeting_scheduler", port=8888):
        super().__init__(name=name, port=port)
        self.meetings: Dict[str, Meeting] = {}
        self.current_slots: Dict[str, TimeSlot] = {}
        self.responses: Dict[str, Dict[str, List[str]]] = {}
        self.scheduled_meetings: Dict[str, MeetingScheduled] = {}
        self._meeting_completed_events: Dict[str, asyncio.Event] = {}
        self._completed_meetings: Dict[str, MeetingOutput] = {}

    async def schedule_meetings(self, meetings: List[Meeting], participants: List[ParticipantAgent]):
        # Store meetings and create completion events
        self.meetings = {str(i): meeting for i, meeting in enumerate(meetings)}
        for meeting_id in self.meetings:
            self._meeting_completed_events[meeting_id] = asyncio.Event()
            self.responses[meeting_id] = {}

        # Start scheduling process
        async with self.play(workers=participants) as active_playground:
            # Initialize scheduling for each meeting
            for meeting_id, meeting in self.meetings.items():
                await self.start_scheduling(meeting_id, meeting)

            # Wait for completion
            await self.wait_for_completion()
            return self.get_completed_meetings()

    async def start_scheduling(self, meeting_id: str, meeting: Meeting):
        """Start scheduling a specific meeting."""
        logger.info(f"Starting scheduling for meeting: {meeting.name}")
        
        # Start with a default time slot for the meeting's date
        initial_slot = TimeSlot(
            date=meeting.date,
            start_time=9,  # Start at 9 AM
            end_time=9 + meeting.duration
        )
        
        self.current_slots[meeting_id] = initial_slot
        
        # Send availability request to all participants
        request = AvailabilityRequest(
            meeting_id=meeting_id,
            time_slot=initial_slot
        )
        
        await self.broadcast_message(request)

    @on(AvailabilityResponse)
    async def handle_response(self, response: AvailabilityResponse, time: int, agent):
        """Handle availability responses from participants."""
        meeting_id = response.meeting_id
        
        # Handle unavailable time slots
        if not response.available:
            if meeting_id in self.current_slots:
                await self.try_next_slot(meeting_id)
            return
        
        # Track response
        self.track_response(response)
        
        # Check if we can schedule the meeting now
        if self.can_schedule(meeting_id):
            await self.schedule_meeting(meeting_id)
    
    def track_response(self, response: AvailabilityResponse):
        """Track participant responses for a meeting."""
        meeting_id = response.meeting_id
        slot_key = f"{response.time_slot.date}_{response.time_slot.start_time}"
        
        if meeting_id not in self.responses:
            self.responses[meeting_id] = {}
            
        if slot_key not in self.responses[meeting_id]:
            self.responses[meeting_id][slot_key] = []
            
        if response.available and response.participant not in self.responses[meeting_id][slot_key]:
            self.responses[meeting_id][slot_key].append(response.participant)
    
    def can_schedule(self, meeting_id: str) -> bool:
        """Check if a meeting can be scheduled with current responses."""
        if meeting_id not in self.meetings or meeting_id not in self.current_slots:
            return False
            
        meeting = self.meetings[meeting_id]
        current_slot = self.current_slots[meeting_id]
        slot_key = f"{current_slot.date}_{current_slot.start_time}"
        
        if meeting_id not in self.responses or slot_key not in self.responses[meeting_id]:
            return False
            
        available_participants = self.responses[meeting_id][slot_key]
        return len(available_participants) >= meeting.minimum_participants
    
    def get_available_participants(self, meeting_id: str) -> List[str]:
        """Get list of available participants for the current slot."""
        current_slot = self.current_slots[meeting_id]
        slot_key = f"{current_slot.date}_{current_slot.start_time}"
        
        if meeting_id in self.responses and slot_key in self.responses[meeting_id]:
            return self.responses[meeting_id][slot_key]
        return []
    
    async def try_next_slot(self, meeting_id: str):
        """Try the next time slot for a meeting."""
        if meeting_id not in self.current_slots or meeting_id not in self.meetings:
            logger.warning(f"Invalid meeting ID in try_next_slot: {meeting_id}")
            return
            
        current_slot = self.current_slots[meeting_id]
        
        # Calculate next slot (move 30 minutes forward)
        next_start = current_slot.start_time + 0.5
        if next_start >= 17:  # Don't schedule past 5 PM
            logger.info(f"No more slots available for meeting {meeting_id}")
            self._complete_meeting(meeting_id, False, error="No suitable time slot found")
            return
            
        meeting = self.meetings[meeting_id]
        next_slot = TimeSlot(
            date=current_slot.date,
            start_time=next_start,
            end_time=next_start + meeting.duration
        )
        
        self.current_slots[meeting_id] = next_slot
        
        # Send new availability request
        request = AvailabilityRequest(
            meeting_id=meeting_id,
            time_slot=next_slot
        )
        
        await self.broadcast_message(request)
    
    async def schedule_meeting(self, meeting_id: str):
        """Schedule a meeting with the current time slot."""
        if meeting_id not in self.current_slots:
            return
            
        current_slot = self.current_slots[meeting_id]
        available_participants = self.get_available_participants(meeting_id)
        
        # Create scheduled meeting
        scheduled = MeetingScheduled(
            meeting_id=meeting_id,
            time_slot=current_slot,
            participants=available_participants
        )
        
        self.scheduled_meetings[meeting_id] = scheduled
        
        # Notify participants
        await self.broadcast_message(scheduled)
        
        # Mark meeting as completed
        self._complete_meeting(meeting_id, True, scheduled)
    
    def _complete_meeting(self, meeting_id: str, success: bool, 
                         scheduled: Optional[MeetingScheduled] = None,
                         error: Optional[str] = None):
        """Record meeting completion status."""
        if meeting_id not in self.meetings:
            return
            
        logger.info(f"Completing meeting {meeting_id}")
        logger.info(f"Success: {success}")
        
        if error:
            logger.error(f"Error: {error}")
        
        # Record completion
        output = MeetingOutput(
            meeting_id=meeting_id,
            name=self.meetings[meeting_id].name,
            scheduled=success,
            error=error
        )
        
        if success and scheduled:
            output.time_slot = scheduled.time_slot
            output.participants = scheduled.participants
        
        self._completed_meetings[meeting_id] = output
        
        # Set completion event
        if meeting_id in self._meeting_completed_events:
            self._meeting_completed_events[meeting_id].set()
    
    async def wait_for_completion(self):
        """Wait for all meetings to be scheduled or failed."""
        waiting_events = [event.wait() for event in self._meeting_completed_events.values()]
        if waiting_events:
            await asyncio.gather(*waiting_events)
    
    def get_completed_meetings(self) -> Dict[str, MeetingOutput]:
        """Get results of all completed meetings."""
        return self._completed_meetings