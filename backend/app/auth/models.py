"""Authentication and authorization Pydantic models and role definitions."""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    EXECUTIVE = "EXECUTIVE"
    OPS_MANAGER = "OPS_MANAGER"
    DATA_ANALYST = "DATA_ANALYST"


class UserBase(BaseModel):
    email: str = Field(..., description="User email address")
    full_name: str = Field(..., description="Full name of user")
    role: UserRole = Field(default=UserRole.OPS_MANAGER, description="Role-based access level")


class UserLoginRequest(BaseModel):
    email: str = Field(..., description="User email", examples=["ops@opspulse.ai"])
    password: str = Field(..., description="Password", examples=["OpsManager123!"])


class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: UserRole = UserRole.OPS_MANAGER


class UserProfile(BaseModel):
    user_id: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool = True
    created_at: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: UserProfile


class DemoUserItem(BaseModel):
    role: UserRole
    email: str
    password: str
    label: str
    description: str
