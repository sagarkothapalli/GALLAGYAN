from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.onboarding import OnboardingRequest

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's profile."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        business_type=current_user.business_type,
        income_range=current_user.income_range,
        persona=current_user.persona,
        pain_points=current_user.pain_points,
        subscription_tier=current_user.subscription_tier,
        onboarding_completed=current_user.onboarding_completed,
    )


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    updates: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile."""
    allowed_fields = {
        "full_name", "business_type", "income_range", "persona",
        "pain_points", "behavioral_profiling_opt_out",
    }

    for key, value in updates.items():
        if key in allowed_fields:
            setattr(current_user, key, value)

    await db.commit()
    await db.refresh(current_user)

    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        business_type=current_user.business_type,
        income_range=current_user.income_range,
        persona=current_user.persona,
        pain_points=current_user.pain_points,
        subscription_tier=current_user.subscription_tier,
        onboarding_completed=current_user.onboarding_completed,
    )


@router.post("/onboarding", response_model=UserResponse)
async def complete_onboarding(
    request: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Complete the onboarding flow."""
    current_user.business_type = request.business_type
    current_user.income_range = request.income_range
    current_user.pain_points = request.pain_points
    current_user.persona = request.persona
    current_user.tax_savings_percent = str(request.tax_savings_percent)
    current_user.onboarding_completed = True

    await db.commit()
    await db.refresh(current_user)

    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        business_type=current_user.business_type,
        income_range=current_user.income_range,
        persona=current_user.persona,
        pain_points=current_user.pain_points,
        subscription_tier=current_user.subscription_tier,
        onboarding_completed=current_user.onboarding_completed,
    )
