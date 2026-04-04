import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()


class GeminiService:
    def __init__(self):
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def generate(self, prompt: str) -> str:
        if not os.environ.get("GEMINI_API_KEY"):
            raise ValueError("GEMINI_API_KEY is not set in .env")
        try:
            result = self.model.generate_content(prompt)
            return result.text
        except Exception as e:
            raise RuntimeError(f"Gemini API Error: {e}")

    def generate_json(self, prompt: str) -> dict:
        full_prompt = f"{prompt}\n\nRespond strictly with valid JSON. No markdown backticks."
        text = self.generate(full_prompt)
        try:
            clean = re.sub(r"```json|```", "", text).strip()
            return json.loads(clean)
        except Exception as e:
            raise RuntimeError(f"Gemini returned invalid JSON: {e}")
