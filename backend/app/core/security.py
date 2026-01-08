"""Security utilities for authentication."""
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import hashlib
import os

# Configuration JWT
SECRET_KEY = os.environ.get("SECRET_KEY", "k-beauty-secret-key-change-in-production-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 jours


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    # Utiliser SHA256 + salt (plus simple et compatible)
    password_hash = hashlib.sha256((plain_password + SECRET_KEY).encode()).hexdigest()
    return password_hash == hashed_password


def get_password_hash(password: str) -> str:
    """Hash a password."""
    # Utiliser SHA256 + salt (plus simple et compatible)
    return hashlib.sha256((password + SECRET_KEY).encode()).hexdigest()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None