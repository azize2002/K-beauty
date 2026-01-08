"""User model."""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime, timezone
from typing import Optional
import uuid
from enum import Enum

class UserRole(str, Enum):
    """User roles."""
    CLIENT = "client"
    ADMIN = "admin"

class User(BaseModel):
    """User model."""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    hashed_password: str
    first_name: str
    last_name: str
    phone: str
    role: UserRole = UserRole.CLIENT
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    """User creation model."""
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str

class UserLogin(BaseModel):
    """User login model."""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """User response model (without password)."""
    id: str
    email: str
    first_name: str
    last_name: str
    phone: str
    role: UserRole
    is_active: bool
    created_at: datetime

class UserUpdate(BaseModel):
    """User update model."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None