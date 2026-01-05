"""Status check routes."""
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.status_check import StatusCheck, StatusCheckCreate
from app.api.deps import get_db
from datetime import datetime
from typing import List

router = APIRouter()


@router.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Hello World"}


@router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Create a status check."""
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get all status checks."""
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

