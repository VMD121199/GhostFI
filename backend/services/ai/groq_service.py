import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


class GroqService:
    def __init__(self):
        self.client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))
        self.model = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.skills = ""
        self._load_skills()

    def _load_skills(self):
        skill_path = os.path.join(os.getcwd(), "StrategySkill.md")
        try:
            if os.path.exists(skill_path):
                with open(skill_path, "r") as f:
                    self.skills = f.read()
                print("📜 [AI Service] Strategic Skills loaded from StrategySkill.md (GROQ Active)")
        except Exception as e:
            print(f"⚠️  Failed to load skills: {e}")

    def generate(self, prompt: str) -> str:
        if not os.environ.get("GROQ_API_KEY"):
            raise ValueError("GROQ_API_KEY is not set in .env")
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a Privacy-First DeFi Research AI Agent. \n\nYOUR STRATEGY SKILLS:\n{self.skills}",
                    },
                    {"role": "user", "content": prompt},
                ],
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            raise RuntimeError(f"Groq API Error: {e}")

    def generate_json(self, prompt: str) -> dict:
        import json
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a DeFi Research AI. ALWAYS respond strictly with valid JSON. Do not include markdown code blocks. \n\nYOUR SKILLS:\n{self.skills}",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
            )
            text = response.choices[0].message.content or "{}"
            return json.loads(text)
        except Exception as e:
            raise RuntimeError(f"GROQ returned invalid JSON: {e}")
