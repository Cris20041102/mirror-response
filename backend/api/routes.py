import random
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.llm_engine import EmpathyEngine
from core.database import get_connection, init_db

router = APIRouter()
engine = EmpathyEngine()
init_db()

VALID_ZONES = {"La Serena", "Coquimbo", "Valle de Elqui"}

class MoodRequest(BaseModel):
    text: str
    city_zone: str = "La Serena"

@router.post("/analyze")
async def analyze_mood(request: MoodRequest):
    try:
        result = engine.process_mood(request.text)
        zone = request.city_zone if request.city_zone in VALID_ZONES else "La Serena"
        conn = get_connection()
        conn.execute(
            'INSERT INTO mood_entries (timestamp, polarity_score, city_zone) VALUES (?, ?, ?)',
            (datetime.utcnow().isoformat(), result['polarity_score'], zone)
        )
        conn.commit()
        conn.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/community")
async def get_community_data():
    conn = get_connection()
    rows = conn.execute('''
        SELECT city_zone,
               AVG(polarity_score) as avg_score,
               COUNT(*) as count
        FROM mood_entries
        WHERE timestamp >= datetime("now", "-24 hours")
        GROUP BY city_zone
    ''').fetchall()
    conn.close()
    zones = {
        row['city_zone']: {
            'avg_score': round(row['avg_score'], 2),
            'count': row['count']
        }
        for row in rows
    }
    return {'zones': zones}

@router.get("/mission")
async def get_mission(score: float = 0.0):
    mood_type = 'positive' if score > 0.1 else ('negative' if score < -0.1 else 'neutral')
    conn = get_connection()
    rows = conn.execute(
        'SELECT text FROM missions WHERE mood_type = ? OR mood_type = "neutral" ORDER BY RANDOM() LIMIT 1',
        (mood_type,)
    ).fetchall()
    conn.close()
    mission = rows[0]['text'] if rows else 'Hoy, dedica un momento a respirar y notar el espacio a tu alrededor.'
    return {'mission': mission}
