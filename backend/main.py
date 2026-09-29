from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import initialize_database
from schemas import IncidentCreate, IncidentResponse
from incident_service import (
    create_and_analyze_incident,
    list_incidents,
    get_single_incident,
    memory,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database when the server starts
    initialize_database()

    # Start the application
    yield

    # Close Hindsight client when the server shuts down
    try:
        await memory.client.aclose()
        print("Hindsight client closed successfully.")
    except Exception as error:
        print(f"Error closing Hindsight client: {error}")


app = FastAPI(
    title="IncidentMind",
    description="AI-powered Incident Management System",
    version="1.0.0",
    lifespan=lifespan,
)


# React frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "IncidentMind API is running",
        "status": "success",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


@app.post("/api/incidents", response_model=IncidentResponse)
def create_incident_endpoint(incident: IncidentCreate):
    try:
        result = create_and_analyze_incident(
            title=incident.title,
            description=incident.description,
            severity=incident.severity,
            category=incident.category,
        )

        return result

    except Exception as error:
        print(f"Error creating incident: {error}")

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@app.get("/api/incidents")
def get_incidents():
    return list_incidents()


@app.get("/api/incidents/{incident_id}")
def get_incident_endpoint(incident_id: int):
    incident = get_single_incident(incident_id)

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return incident