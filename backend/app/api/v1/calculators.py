from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.calculator_result import CalculatorResult
from app.schemas.calculator import CalculatorSaveRequest, CalculatorSaveResponse

router = APIRouter()


@router.post("/save", response_model=CalculatorSaveResponse)
async def save_calculator_result(
    request: CalculatorSaveRequest,
    db: AsyncSession = Depends(get_db),
):
    """Save a calculator result for future reference."""
    result = CalculatorResult(
        calculator_type=request.calculator_type,
        inputs=request.inputs,
        result=request.result,
    )
    db.add(result)
    await db.commit()
    await db.refresh(result)

    return CalculatorSaveResponse(id=str(result.id))
