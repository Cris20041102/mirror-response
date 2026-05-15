import random
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.llm_engine import EmpathyEngine
from core.database import get_connection, init_db

router = APIRouter()
engine = EmpathyEngine()

try:
        init_db()
except Exception:
        pass

VALID_ZONES = {"La Serena", "Coquimbo", "Valle de Elqui"}

class MoodRequest(BaseModel):
        text: str
        city_zone: str = "La Serena"

@router.post("/analyze")
async def analyze_mood(request: MoodRequest):
        try:
                    result = engine.process_mood(request.text)
                    zone = request.city_zone if request.city_zone in VALID_ZONES else "La Serena"
                    try:
                                    conn = get_connection()
                                    conn.execute(
                                        'INSERT INTO mood_entries (timestamp, polarity_score, city_zone) VALUES (?, ?, ?)',
                                        (datetime.utcnow().isoformat(), result['polarity_score'], zone)
                                    )
                                    conn.commit()
                                    conn.close()
        except Exception:
                        pass
                    return result
except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_history():
        try:
                    conn = get_connection()
                    rows = conn.execute(
                        'SELECT * FROM mood_entries ORDER BY timestamp DESC LIMIT 50'
                    ).fetchall()
                    conn.close()
                    return {"entries": [dict(row) for row in rows]}
except Exception:
        return {"entries": []}

@router.get("/zones/stats")
async def get_zones_stats():
        try:
                    conn = get_connection()
                    rows = conn.execute('''
                        SELECT city_zone, COUNT(*) as count, AVG(polarity_score) as avg_score
                        FROM mood_entries
                        GROUP BY city_zone
                    ''').fetchall()
                    conn.close()
                    zones = {
                        row["city_zone"]: {"count": row["count"], "avg_score": round(row["avg_score"], 2)}
                        for row in rows
                    }
                    return {"zones": zones}
except Exception:
        return {"zones": {}}

@router.get("/community")
async def get_community():
        try:
                    conn = get_connection()
                    rows = conn.execute('''
                        SELECT city_zone, COUNT(*) as count, AVG(polarity_score) as avg_score
                        FROM mood_entries
                        GROUP BY city_zone
                    ''').fetchall()
                    conn.close()
                    zones = {
                        row["city_zone"]: {"count": row["count"], "avg_score": round(row["avg_score"], 2)}
                        for row in rows
                    }
                    return {"zones": zones}
except Exception:
        return {"zones": {}}

@router.get("/legacy/stats")
async def get_legacy_stats():
        try:
                    conn = get_connection()
                    rows = conn.execute('''
                        SELECT
                            ROUND(latitude, 1) as lat,
                            ROUND(longitude, 1) as lon,
                            COUNT(*) as count,
                            AVG(CASE type WHEN 'empatia' THEN 0.7 WHEN 'gratitud' THEN 0.3 ELSE 0.0 END) as avg_score
                        FROM legacy_events
                        GROUP BY ROUND(latitude, 1), ROUND(longitude, 1)
                    ''').fetchall()
                    conn.close()
                    real = [{"lat": row["lat"], "lon": row["lon"], "count": row["count"], "avg_score": round(row["avg_score"], 2)} for row in rows]
                    return {"real": real, "simulated": []}
except Exception:
        return {"real": [], "simulated": []}

@router.get("/legacy/pulse")
async def get_legacy_pulse():
        try:
                    conn = get_connection()
                    row = conn.execute(
                        'SELECT COUNT(*) as total FROM legacy_events'
                    ).fetchone()
                    conn.close()
                    total = row["total"] if row else 0
                    return {"total": total}
except Exception:
        total = 0
        return {"total": total}

@router.get("/mission")
async def get_mission(score: float = 0.0):
        if score > 0.3:
                    mission = "Comparte una palabra amable con alguien hoy."
elif score > 0:
        mission = "Toma un momento para respirar profundo y agradecer algo pequeno."
else:
        mission = "Hoy, dedica un momento a respirar y notar el espacio a tu alrededor."
    return {"mission": mission}

@router.post("/legacy/complete")
async def complete_legacy(payload: dict):
        action_type = payload.get("type", "gratitud")
    lat = payload.get("latitude", -29.96)
    lon = payload.get("longitude", -71.34)
    try:
                conn = get_connection()
                conn.execute(
                    'INSERT INTO legacy_events (user_id, type, latitude, longitude, timestamp) VALUES (?, ?, ?, ?, ?)',
                    (payload.get("user_id", "anonymous"), action_type, lat, lon, datetime.utcnow().isoformat())
                )
                conn.commit()
                conn.close()
except Exception:
        pass
    return {
                "success": True,
                "status": "ok",
                "message": "Accion registrada correctamente",
                "type": action_type,
                "lat": lat,
                "lon": lon
    }
