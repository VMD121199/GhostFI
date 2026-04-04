import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))
        self.model = os.environ.get("OPENAI_MODEL", "gpt-4o")
        self.skills = ""
        self._load_skills()

    def _load_skills(self):
        skill_path = os.path.join(os.getcwd(), "skill.md")
        try:
            if os.path.exists(skill_path):
                with open(skill_path, "r") as f:
                    self.skills = f.read()
                print("📜 [AI Service] Skills loaded from skill.md")
        except Exception as e:
            print(f"⚠️  Failed to load skills: {e}")

    def generate(self, prompt: str) -> str:
        if not os.environ.get("OPENAI_API_KEY"):
            raise ValueError("OPENAI_API_KEY is not set in .env")
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a Privacy-First DeFi AI Agent. \n\nCORE SKILLS AND RULES:\n{self.skills}",
                    },
                    {"role": "user", "content": prompt},
                ],
            )
            return completion.choices[0].message.content or ""
        except Exception as e:
            raise RuntimeError(f"OpenAI API Error: {e}")

    def generate_json(self, prompt: str) -> dict:
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a DeFi Analysis AI. Respond ONLY with valid JSON. \n\nCORE SKILLS:\n{self.skills}",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
            )
            text = completion.choices[0].message.content or "{}"
            return json.loads(text)
        except Exception as e:
            raise RuntimeError(f"OpenAI returned invalid JSON: {e}")
