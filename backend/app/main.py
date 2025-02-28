from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database import Base, engine
from backend.app.routers import participants, meetings, scheduling

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Meeting Scheduler API",
    description="API for a distributed meeting scheduling system using Ceylon framework",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(participants.router)
app.include_router(meetings.router)
app.include_router(scheduling.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Meeting Scheduler API",
        "documentation": "/docs",
        "endpoints": [
            {"path": "/participants", "description": "Manage participants"},
            {"path": "/meetings", "description": "Manage meetings"},
            {"path": "/scheduling", "description": "Run and check scheduling"}
        ]
    }