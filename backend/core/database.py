import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'mood_history.db')

MISSIONS = [
    ("Mañana, busca un árbol en tu camino y dedica un minuto a agradecer su sombra.", "positive"),
    ("Deja una nota de aliento anónima en un lugar público hoy.", "positive"),
    ("Escríbele a alguien que no has contactado en un tiempo. Solo para decirle que piensas en él o ella.", "positive"),
    ("Comparte algo hermoso que veas hoy — un color, una forma, una luz — con alguien cercano.", "positive"),
    ("Al terminar el día, escribe tres cosas pequeñas por las que estás agradecido/a.", "neutral"),
    ("Haz una pausa de tres minutos para respirar profundo y notar el espacio a tu alrededor.", "neutral"),
    ("Hoy, al caminar, fíjate en el cielo. El universo es más grande que cualquier problema.", "negative"),
    ("Permítete sentir sin juzgar. Toma un té o agua caliente y siéntate en silencio cinco minutos.", "negative"),
    ("Pon una canción que te guste y déjate llevar por ella sin hacer nada más.", "negative"),
]

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def migrate_db():
    conn = get_connection()
    for stmt in [
        'ALTER TABLE mood_entries ADD COLUMN country TEXT DEFAULT "Chile"',
    ]:
        try:
            conn.execute(stmt)
            conn.commit()
        except Exception:
            pass
    conn.close()

def init_db():
    conn = get_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS mood_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            polarity_score REAL NOT NULL,
            city_zone TEXT DEFAULT "La Serena"
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS missions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            mood_type TEXT NOT NULL
        )
    ''')
    count = conn.execute('SELECT COUNT(*) as c FROM missions').fetchone()['c']
    if count == 0:
        conn.executemany('INSERT INTO missions (text, mood_type) VALUES (?, ?)', MISSIONS)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS legacy_events (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id   TEXT NOT NULL,
            type      TEXT NOT NULL,
            latitude  REAL NOT NULL,
            longitude REAL NOT NULL,
            timestamp TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()
    migrate_db()
