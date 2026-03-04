from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.quiz_result import QuizResult
from app.schemas.quiz import QuizSubmitRequest, QuizResultResponse

router = APIRouter()

# ── Persona calculation (mirrors frontend logic) ────────────
PERSONA_SCORES_DEFAULT = {
    "new-freelancer": 0,
    "cash-flow-builder": 0,
    "tax-optimizer": 0,
    "scale-ready": 0,
}


def calculate_persona(answers: dict[int, str]) -> dict:
    """Simplified server-side persona calculation.
    In production, the full question/option point mapping would be stored
    in a config or database, not hardcoded.
    """
    scores = dict(PERSONA_SCORES_DEFAULT)

    # Simple heuristic mapping
    for _qid, answer in answers.items():
        if answer in ("beginner", "low", "unaware", "none", "guessing", "viability", "setup"):
            scores["new-freelancer"] += 3
        elif answer in ("early", "mid", "aware", "basic", "hourly", "inconsistency", "smoothing", "unpredictable", "somewhat"):
            scores["cash-flow-builder"] += 2
        elif answer in ("established", "high", "paying", "structured", "moderate", "project", "organized", "taxes", "tax-strategy", "predictable"):
            scores["tax-optimizer"] += 2
        elif answer in ("veteran", "very-high", "optimized", "advanced", "value", "automated", "growth", "scaling", "stable", "strong"):
            scores["scale-ready"] += 3

    persona = max(scores, key=scores.get)  # type: ignore
    max_possible = len(answers) * 3
    advanced_score = scores["tax-optimizer"] + scores["scale-ready"]
    health_score = min(100, max(10, round((advanced_score / max_possible) * 100)))

    strengths_map = {
        "new-freelancer": ["Taking initiative early", "Open to building good habits"],
        "cash-flow-builder": ["Awareness of income patterns", "Seeking stability"],
        "tax-optimizer": ["Strong income generation", "Proactive on tax reduction"],
        "scale-ready": ["Solid financial foundation", "Strategic growth mindset"],
    }
    improvements_map = {
        "new-freelancer": ["Set up separate accounts", "Start saving 25-30% for taxes", "Build 3-month emergency fund"],
        "cash-flow-builder": ["Implement a salary floor", "Explore retainer models", "Grow emergency fund to 6+ months"],
        "tax-optimizer": ["Evaluate S-Corp election", "Maximize retirement contributions", "Hire a CPA"],
        "scale-ready": ["Develop value-based pricing", "Explore subcontractors", "Plan cross-border opportunities"],
    }

    return {
        "persona": persona,
        "scores": scores,
        "health_score": health_score,
        "strengths": strengths_map.get(persona, []),
        "improvements": improvements_map.get(persona, []),
    }


@router.post("/submit", response_model=QuizResultResponse)
async def submit_quiz(
    request: QuizSubmitRequest,
    db: AsyncSession = Depends(get_db),
):
    """Submit quiz answers and get persona assignment."""
    if len(request.answers) < 5:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please answer at least 5 questions.",
        )

    result = calculate_persona(request.answers)

    quiz_result = QuizResult(
        persona=result["persona"],
        health_score=result["health_score"],
        scores=result["scores"],
        answers=request.answers,
        strengths=result["strengths"],
        improvements=result["improvements"],
    )
    db.add(quiz_result)
    await db.commit()
    await db.refresh(quiz_result)

    return QuizResultResponse(
        id=str(quiz_result.id),
        persona=result["persona"],
        health_score=result["health_score"],
        scores=result["scores"],
        strengths=result["strengths"],
        improvements=result["improvements"],
    )


@router.get("/result/{result_id}", response_model=QuizResultResponse)
async def get_quiz_result(result_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve a saved quiz result."""
    stmt = select(QuizResult).where(QuizResult.id == result_id)
    row = await db.execute(stmt)
    quiz_result = row.scalar_one_or_none()

    if not quiz_result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found.")

    return QuizResultResponse(
        id=str(quiz_result.id),
        persona=quiz_result.persona,
        health_score=quiz_result.health_score,
        scores=quiz_result.scores,
        strengths=quiz_result.strengths or [],
        improvements=quiz_result.improvements or [],
    )
