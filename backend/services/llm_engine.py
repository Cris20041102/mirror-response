import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class EmpathyEngine:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel(
            'gemini-2.5-flash',
            generation_config={"response_mime_type": "application/json"}
        )

    def process_mood(self, user_text: str) -> dict:
        if not user_text.strip():
            raise ValueError("El texto está vacío")

        prompt = f"""
        Eres un asistente terapéutico experto en soporte emocional. 
        Analiza el siguiente texto del usuario sin importar en qué idioma esté: "{user_text}"
        
        Debes responder estrictamente con un objeto JSON válido que contenga estas claves:
        - "polarity_score": Un número de -1.0 (muy triste/enojado) a 1.0 (muy feliz).
        - "validation": Una frase corta y empática validando cómo se siente en el mismo idioma que usó.
        - "message": Un mensaje reflexivo o de apoyo.
        - "song": Una recomendación musical de CUALQUIER artista del mundo que encaje con la emoción (Formato: "Título - Artista").
        - "action": Una pequeña acción sugerida para mejorar o mantener su estado de ánimo.
        """

        try:
            response = self.model.generate_content(prompt)
            return json.loads(response.text)
        except Exception as e:
            print(f"Error en la IA: {e}")
            return {
                "polarity_score": 0.0,
                "validation": "Te escucho.",
                "message": "A veces la tecnología falla, pero tus emociones son válidas.",
                "song": "Human Nature - Michael Jackson",
                "action": "Tómate un momento para respirar profundo."
            }
