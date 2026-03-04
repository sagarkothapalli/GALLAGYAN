from typing import Any
from pydantic import BaseModel, EmailStr


class EmailCaptureRequest(BaseModel):
    email: EmailStr
    source: str
    metadata: dict[str, Any] | None = None
