# 🪞 Mirror Response

> Una PWA de soporte emocional que escucha, valida y acompaña — impulsada por IA.

Mirror Response analiza lo que sientes y te responde con empatía: una validación emocional, un mensaje de apoyo, una canción para el momento y una pequeña acción para seguir adelante.

---

## ✨ Funcionalidades

- 🧠 **Análisis de sentimiento** con puntuación de polaridad (-1.0 a +1.0)
- 💬 **Validación empática** en el mismo idioma que uses (español, inglés, etc.)
- 🎧 **Recomendación musical** acorde a tu estado emocional
- ✅ **Acción sugerida** para cuidar tu bienestar
- 📱 **PWA** — instalable en móvil, funciona sin conexión (con caché)

---

## 🗂️ Estructura del Proyecto

```
mirror-response/
├── backend/
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py          # Endpoint POST /api/analyze
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py          # Configuración central (extensible)
│   ├── services/
│   │   ├── __init__.py
│   │   └── llm_engine.py      # EmpathyEngine — lógica con Gemini
│   ├── main.py                # App FastAPI + CORS
│   ├── requirements.txt
│   └── .env.example           # Variables de entorno requeridas
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js             # Lógica del cliente + registro SW
│   ├── icons/                 # Íconos PWA (192px y 512px)
│   ├── index.html
│   ├── manifest.json          # Configuración PWA
│   └── sw.js                  # Service Worker para caché offline
│
├── .gitignore
└── README.md
```

---

## 🚀 Instalación y Uso

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/mirror-response.git
cd mirror-response
```

### 2. Configurar el backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Crea tu archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

Edita `.env` y agrega tu API Key de Gemini:

```
GEMINI_API_KEY=tu_api_key_aqui
```

> Obtén tu key en [Google AI Studio](https://aistudio.google.com/app/apikey) — es gratuita.

### 3. Iniciar el servidor

```bash
python main.py
# El backend queda en http://localhost:8000
```

### 4. Abrir el frontend

Sirve la carpeta `frontend/` con cualquier servidor estático. Opción rápida:

```bash
cd ../frontend
npx serve .
# O con Python: python -m http.server 3000
```

Abre `http://localhost:3000` en tu navegador.

---

## 🔌 API

### `POST /api/analyze`

**Body:**
```json
{ "text": "Me siento muy cansado y sin motivación" }
```

**Respuesta:**
```json
{
  "polarity_score": -0.6,
  "validation": "Es completamente válido sentirse agotado a veces.",
  "message": "El cansancio es una señal de que necesitas descanso, no debilidad.",
  "song": "The Night Will Always Win - Manchester Orchestra",
  "action": "Apaga las pantallas 20 minutos antes de dormir esta noche."
}
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Python · FastAPI · Uvicorn |
| IA | Google Gemini 2.5 Flash |
| Frontend | HTML · CSS · JavaScript vanilla |
| PWA | Service Worker · Web App Manifest |

---

## 🔒 Variables de Entorno

| Variable | Descripción |
|---|---|
| `GEMINI_API_KEY` | API Key de Google Gemini (obligatoria) |

**Importante:** Nunca subas tu `.env` al repositorio. Ya está incluido en `.gitignore`.

---

## 📌 Próximas mejoras (ideas)

- [ ] Historial de estados de ánimo con gráfico temporal
- [ ] Modo oscuro
- [ ] Integración con Spotify para reproducir la canción sugerida
- [ ] Autenticación de usuarios para guardar sesiones
- [ ] Deploy en Railway / Render + Vercel

---

## 📄 Licencia

MIT — libre para usar, modificar y compartir.
