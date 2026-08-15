"""Authentication API Router for OpsPulse AI."""
from datetime import timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from backend.app.config import settings
from backend.app.auth.models import (
    UserLoginRequest,
    UserRegisterRequest,
    TokenResponse,
    UserProfile,
    DemoUserItem
)
from backend.app.auth.security import create_access_token
from backend.app.auth.service import auth_service
from backend.app.auth.dependencies import get_current_user

auth_router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


@auth_router.post("/login", response_model=TokenResponse, summary="User Login & JWT Generation")
def login(request: UserLoginRequest):
    """Authenticate user with email and password, returning a signed JWT Bearer token."""
    user = auth_service.authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue signed JWT token with claims
    token_data = {
        "sub": user.user_id,
        "email": user.email,
        "role": user.role.value,
        "full_name": user.full_name
    }
    expires_minutes = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    access_token = create_access_token(token_data, expires_delta=timedelta(minutes=expires_minutes))

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in_minutes=expires_minutes,
        user=user
    )


@auth_router.post("/register", response_model=TokenResponse, summary="Register New User Account")
def register(request: UserRegisterRequest):
    """Register a new user account with role assignment."""
    try:
        user = auth_service.create_user(
            email=request.email,
            password=request.password,
            full_name=request.full_name,
            role=request.role
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        ) from e

    token_data = {
        "sub": user.user_id,
        "email": user.email,
        "role": user.role.value,
        "full_name": user.full_name
    }
    expires_minutes = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    access_token = create_access_token(token_data, expires_delta=timedelta(minutes=expires_minutes))

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in_minutes=expires_minutes,
        user=user
    )


@auth_router.get("/me", response_model=UserProfile, summary="Get Current Authenticated User Profile")
def get_me(current_user: UserProfile = Depends(get_current_user)):
    """Retrieve profile and RBAC permissions for the active authenticated user."""
    return current_user


@auth_router.get("/demo-users", response_model=list[DemoUserItem], summary="List Pre-Seeded Demo Accounts")
def list_demo_users():
    """Retrieve pre-configured demo user credentials for instant 1-click portfolio authentication."""
    return auth_service.get_demo_users()


@auth_router.post("/logout", summary="User Logout")
def logout(current_user: UserProfile = Depends(get_current_user)):
    """Acknowledge user logout and session revocation."""
    return {
        "status": "success",
        "message": f"User '{current_user.email}' logged out successfully."
    }
