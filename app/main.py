from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import os, json

from .generator import generate_ai_roadmap
from vertexai.generative_models import GenerativeModel

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT") or "pathfinder-ai-477617"
app = FastAPI(title="PathFinder AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- MODELS ----------
class RequestModel(BaseModel):
    job_title: str

class CompareModel(BaseModel):
    role_a: str
    role_b: str

# ---------- HEALTH ----------
@app.get("/api/health")
def health():
    return {"status": "ok"}

# ---------- GENERATE ROADMAP ----------
@app.post("/api/generate")
def generate(req: RequestModel):
    job = req.job_title.strip()
    if not job:
        raise HTTPException(status_code=400, detail="Job title required.")
    try:
        roadmap = generate_ai_roadmap(PROJECT_ID, job)
        return roadmap
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- COMPARE ROLES ----------
@app.post("/api/compare")
def compare_roles(req: CompareModel):
    role_a, role_b = req.role_a.strip(), req.role_b.strip()
    if not role_a or not role_b:
        raise HTTPException(status_code=400, detail="Both roles are required.")

    try:
        model = GenerativeModel("gemini-1.5-flash")

        PROMPT = f"""
        Compare two careers: "{role_a}" and "{role_b}".
        Generate a detailed but concise JSON with:
        - summary: paragraph comparing focus, industry trends, and difficulty
        - table: 6-8 rows comparing metrics (Primary Focus, Top Skills, Avg Salary, Growth Rate, Typical Experience, Education, Tools)
        - skills_overlap: list of shared skills
        - unique_a: list of skills unique to {role_a}
        - unique_b: list of skills unique to {role_b}
        - suggestions: 3 actionable insights (like which suits which learner, how to transition, and future growth)
        Return only valid JSON.
        """

        resp = model.generate_content(PROMPT)
        try:
            data = json.loads(resp.text)
            data["ai_generated"] = True
            return data
        except Exception:
            return {"ai_text": resp.text, "ai_generated": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
