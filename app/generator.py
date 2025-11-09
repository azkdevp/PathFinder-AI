import json, os
from typing import Dict, Any
from vertexai import init
from vertexai.generative_models import GenerativeModel

# ───────────────────────────────────────────────────────────
# Initialize Vertex AI (Project + Region)
# ───────────────────────────────────────────────────────────
init(project="pathfinder-ai-477617", location="us-central1")

MODEL = GenerativeModel("gemini-2.5-flash")

# ───────────────────────────────────────────────────────────
# Optional fallback dataset for offline testing
# ───────────────────────────────────────────────────────────
def load_jobs() -> Dict[str, Any]:
    data_path = os.path.join(os.path.dirname(__file__), "data", "jobs.json")
    if os.path.exists(data_path):
        with open(data_path, "r") as f:
            return json.load(f)
    return {}

JOBS = load_jobs()

# ───────────────────────────────────────────────────────────
# Roadmap prompt (tuned for realistic data)
# ───────────────────────────────────────────────────────────
SYNTH_PROMPT = """
You are an expert career mentor and data analyst.
Generate a realistic skill roadmap for the role "{role}".
Include data context from 2024–2025 U.S. labor market insights (salary, growth, learning duration).

Return a *valid JSON only* object with the following keys:
- skills: an ordered list of 10 essential, practical skills
- courses: a list of 3–5 {{"title": str, "url": str}} objects from trusted free sources
- duration_months: integer estimate (how many months to become job-ready, typically 3–12)
- avg_salary_usd: salary range as a short string (e.g., "85k–120k")
Ensure concise wording and no markdown or commentary.
"""

# ───────────────────────────────────────────────────────────
# Function: Generate AI Roadmap
# ───────────────────────────────────────────────────────────
def generate_ai_roadmap(project_id: str, role: str) -> Dict[str, Any]:
    try:
        resp = MODEL.generate_content(SYNTH_PROMPT.format(role=role))
        text = resp.text.strip()
        data = json.loads(text)
        data["ai_generated"] = True
        data["role"] = role
        return data
    except Exception as e:
        return {
            "error": str(e),
            "ai_text": getattr(resp, "text", "No response"),
            "role": role,
            "ai_generated": True,
        }

# ───────────────────────────────────────────────────────────
# Function: Retrieve Roadmap (cached or AI)
# ───────────────────────────────────────────────────────────
def build_roadmap(role: str) -> Dict[str, Any]:
    key = role.strip().lower()
    if key in JOBS:
        base = JOBS[key]
        base["role"] = role
        base["ai_generated"] = False
        return base
    ai = generate_ai_roadmap("pathfinder-ai-477617", role)
    return ai
