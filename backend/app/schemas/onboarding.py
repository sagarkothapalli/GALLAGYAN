from pydantic import BaseModel


class OnboardingRequest(BaseModel):
    business_type: str
    income_range: str
    pain_points: list[str]
    persona: str
    tax_savings_percent: int
