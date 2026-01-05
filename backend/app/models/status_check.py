"""Status check models."""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
import uuid


class StatusCheck(BaseModel):
    """Status check model."""
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    """Status check creation model."""
    client_name: str

