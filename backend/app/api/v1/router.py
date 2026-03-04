from fastapi import APIRouter

from app.api.v1 import auth, users, quiz, calculators, email, education

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])
api_router.include_router(calculators.router, prefix="/calculators", tags=["Calculators"])
api_router.include_router(email.router, prefix="/email", tags=["Email"])
api_router.include_router(education.router, prefix="/education", tags=["Education"])
