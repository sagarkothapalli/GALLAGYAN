from typing import Any
from pydantic import BaseModel


class CalculatorSaveRequest(BaseModel):
    calculator_type: str
    inputs: dict[str, Any]
    result: dict[str, Any]


class CalculatorSaveResponse(BaseModel):
    id: str
