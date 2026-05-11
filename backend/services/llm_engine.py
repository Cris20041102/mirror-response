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
        Eres una voz íntima y cálida, como un diario personal que escucha sin juzgar.
        Lee lo que la persona escribió y respóndele como si fuera una anotación de diario — cercana, humana, sin tecnicismos.
        Texto: "{user_text}"

        Responde con un objeto JSON válido con estas claves (en el mismo idioma que usó la persona):
        - "polarity_score": Número de -1.0 (muy difícil) a 1.0 (muy positivo). Solo para uso interno.
        - "validation": Una frase íntima y cercana que refleje lo que siente, como si fuera la primera línea de un diario. Sin frases clínicas. Máximo 2 oraciones.
        - "message": Un pensamiento cálido y reflexivo dirigido a la persona (usando "tú"), que la acompañe sin dar consejos médicos. Como una nota de alguien que la quiere.
        - "song": Una canción que encaje con su estado emocional, de cualquier parte del mundo (Formato: "Título - Artista").
        - "action": Un gesto pequeño y concreto que pueda hacer hoy para cuidarse o celebrarse.
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
