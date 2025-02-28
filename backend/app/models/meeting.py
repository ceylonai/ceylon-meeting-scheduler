from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from backend.app.database import Base


# Base = declarative_base()

class Meeting(Base):
    __tablename__ = "meetings"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    date = Column(String, nullable=False)
    duration = Column(Integer, nullable=False)  # Store duration in hours
    minimum_participants = Column(Integer, default=2)
    
    participants = relationship("MeetingParticipant", back_populates="meeting")
    scheduled_slot_id = Column(Integer, ForeignKey("scheduled_slots.id"), nullable=True)
    scheduled_slot = relationship("ScheduledSlot", back_populates="meeting")

class MeetingParticipant(Base):
    __tablename__ = "meeting_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    participant_id = Column(Integer, ForeignKey("participants.id"))
    
    meeting = relationship("Meeting", back_populates="participants")
    participant = relationship("Participant", back_populates="meetings")

class ScheduledSlot(Base):
    __tablename__ = "scheduled_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    start_time = Column(Integer, nullable=False)
    end_time = Column(Integer, nullable=False)
    
    meeting = relationship("Meeting", back_populates="scheduled_slot")