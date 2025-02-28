from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from backend.app.database import Base


# Base = declarative_base()

class TimeSlot(Base):
    __tablename__ = "time_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    start_time = Column(Integer, nullable=False)  # Store as hour (0-23)
    end_time = Column(Integer, nullable=False)    # Store as hour (0-23)
    participant_id = Column(Integer, ForeignKey("participants.id"))
    
    participant = relationship("Participant", back_populates="available_slots")