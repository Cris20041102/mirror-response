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

COUNTRY_COORDS = {
        "Chile":     {"lat": -30.0, "lon": -71.2},
        "Japan":     {"lat": 35.68, "lon": 139.69},
        "Brazil":    {"lat": -23.5, "lon": -46.6},
        "India":     {"lat": 19.07, "lon": 72.87},
        "France":    {"lat": 48.85, "lon": 2.35},
        "USA":       {"lat": 40.71, "lon": -74.0},
        "Kenya":     {"lat": -1.29, "lon": 36.82},
        "Australia": {"lat": -33.8, "lon": 151.2},
}

SIMULATED_LEGACY = [
        {"country": "Japan",     "count": 14, "avg_score": 0.6,  "lat": 35.68,  "lon": 139.69},
        {"country": "Brazil",    "count": 9,  "avg_score": 0.45, "lat": -23.5,  "lon": -46.6},
        {"country": "India",     "count": 17, "avg_score": 0.35, "lat": 19.07,  "lon": 72.87},
        {"country": "France",    "count": 7,  "avg_score": 0.5,  "lat": 48.85,  "lon": 2.35},
        {"country": "USA",       "count": 21, "avg_score": 0.4,  "lat": 40.71,  "lon": -74.0},
        {"country": "Kenya",     "count": 5,  "avg_score": 0.7,  "lat": -1.29,  "lon": 36.82},
        {"country": "Australia", "count": 8,  "avg_score": 0.55, "lat": -33.8,  "lon": 151.2},
]

@router.get("/legacy/stats")
async def get_legacy_stats():
        try:
                    conn = get_connection()
                    rows = conn.execute('''
                        SELECT country, COUNT(*) as count, AVG(polarity_score) as avg_score
                        FROM mood_entries
                        WHERE country IS NOT NULL
                        GROUP BY country
                    ''').fetchall()
                    conn.close()
                    zones = [
                        {
                            "country": row["country"],
                            "count": row["count"],
                            "avg_score": round(row["avg_score"], 2),
                            **COUNTRY_COORDS.get(row["country"], {"lat": 0, "lon": 0})
                        }
                        for row in rows
                    ]
                    return {"zones": zones + SIMULATED_LEGACY}
except Exception:
        return {"zones": SIMULATED_LEGACY}

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
                    zones = [
                        {
                            "zone": row["city_zone"],
                            "count": row["count"],
                            "avg_score": round(row["avg_score"], 2)
                        }
                        for row in rows
                    ]
                    return {"zones": zones}
except Exception:
        return {"zones": []}
