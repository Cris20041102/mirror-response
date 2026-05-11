from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.llm_engine import EmpathyEngine

router = APIRouter()
engine = EmpathyEngine()

class MoodRequest(BaseModel):
    text: str

@router.post("/analyze")
async def analyze_mood(request: MoodRequest):
    try:
        result = engine.process_mood(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
