from pydantic import BaseModel


class QuizSubmitRequest(BaseModel):
    answers: dict[int, str]


class QuizResultResponse(BaseModel):
    id: str
    persona: str
    health_score: int
    scores: dict[str, int]
    strengths: list[str]
    improvements: list[str]
