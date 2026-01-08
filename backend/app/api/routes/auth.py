"""Authentication routes."""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone

from app.db.connection import get_database
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token
)
from app.models.user import UserRole

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)


# Schemas
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: str
    role: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Helper function to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré"
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    
    db = await get_database()
    user = await db.users.find_one({"id": user_id})
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé"
        )
    
    return user


# Optional: Get current user if logged in, None otherwise
async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user if logged in, None otherwise."""
    if credentials is None:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


# Routes
@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup):
    """Create a new user account."""
    db = await get_database()
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà utilisé"
        )
    
    # Check if phone already exists
    existing_phone = await db.users.find_one({"phone": user_data.phone})
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce numéro de téléphone est déjà utilisé"
        )
    
    # Create user
    import uuid
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    new_user = {
        "id": user_id,
        "email": user_data.email.lower(),
        "hashed_password": get_password_hash(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "phone": user_data.phone,
        "role": UserRole.CLIENT.value,
        "is_active": True,
        "is_verified": False,
        "created_at": now,
        "updated_at": now
    }
    
    await db.users.insert_one(new_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user_id,
            email=new_user["email"],
            first_name=new_user["first_name"],
            last_name=new_user["last_name"],
            phone=new_user["phone"],
            role=new_user["role"],
            created_at=now
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    """Login with email and password."""
    db = await get_database()
    
    # Find user by email
    user = await db.users.find_one({"email": user_data.email.lower()})
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    # Verify password
    if not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            first_name=user["first_name"],
            last_name=user["last_name"],
            phone=user["phone"],
            role=user["role"],
            created_at=user["created_at"]
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        first_name=current_user["first_name"],
        last_name=current_user["last_name"],
        phone=current_user["phone"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )


@router.put("/me")
async def update_me(
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    phone: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Update current user profile."""
    db = await get_database()
    
    update_data = {"updated_at": datetime.now(timezone.utc)}
    
    if first_name:
        update_data["first_name"] = first_name
    if last_name:
        update_data["last_name"] = last_name
    if phone:
        # Check if phone is already used by another user
        existing = await db.users.find_one({"phone": phone, "id": {"$ne": current_user["id"]}})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce numéro est déjà utilisé"
            )
        update_data["phone"] = phone
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": update_data}
    )
    
    return {"message": "Profil mis à jour"}