from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from backend.app.database import Base


# Base = declarative_base()

class Participant(Base):
    __tablename__ = "participants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    is_active = Column(Boolean, default=True)
    
    available_slots = relationship("TimeSlot", back_populates="participant")
    meetings = relationship("MeetingParticipant", back_populates="participant")