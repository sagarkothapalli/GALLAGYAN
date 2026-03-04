from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.email_capture import EmailCapture
from app.schemas.email import EmailCaptureRequest

router = APIRouter()


@router.post("/capture")
async def capture_email(
    request: EmailCaptureRequest,
    db: AsyncSession = Depends(get_db),
):
    """Capture an email address for lead nurturing.

    Sources include: quiz-results, tax-estimator, emergency-fund-calc,
    pricing-converter, article-*, newsletter, etc.
    """
    capture = EmailCapture(
        email=request.email,
        source=request.source,
        metadata_=request.metadata,
    )
    db.add(capture)
    await db.commit()

    # In production, trigger the appropriate email drip sequence via
    # Customer.io, Braze, or Resend depending on the source.
    # For example:
    # if request.source == "quiz-results":
    #     await send_quiz_results_email(request.email, request.metadata)
    # elif request.source.startswith("article-"):
    #     await add_to_newsletter(request.email)

    return {"success": True, "message": "Email captured successfully."}
