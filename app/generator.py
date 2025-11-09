import json, os
from typing import Dict, Any
from vertexai import init
from vertexai.generative_models import GenerativeModel

# Initialize Vertex AI
init(project="pathfinder-ai-477617", location="us-central1")

# Use public model
MODEL = GenerativeModel("gemini-2.5-flash")

def load_jobs() -> Dict[str, Any]:
    data_path = os.path.join(os.path.dirname(__file__), "data", "jobs.json")
    if os.path.exists(data_path):
        with open(data_path, "r") as f:
            return json.load(f)
    return {}

JOBS = load_jobs()

SYNTH_PROMPT = """You are a career mentor. Generate a concise skill roadmap for the role: "{role}".
Return JSON with keys:
skills (10-item list),
courses (list of {{title,url}} objects using high-quality free sources),
duration_months (integer 3-9),
avg_salary_usd (string range).
Keep skills practical and sequenced.
"""

def generate_ai_roadmap(project_id: str, role: str) -> Dict[str, Any]:
    resp = MODEL.generate_content(SYNTH_PROMPT.format(role=role))
    try:
        data = json.loads(resp.text)
        data["ai_generated"] = True
        return data
    except Exception:
        return {"ai_text": resp.text, "ai_generated": True}

def build_roadmap(role: str) -> Dict[str, Any]:
    key = role.strip().lower()
    if key in JOBS:
        base = JOBS[key]
        base["role"] = role
        base["ai_generated"] = False
        return base
    ai = generate_ai_roadmap("pathfinder-ai-477617", role)
    ai["role"] = role
    return ai
