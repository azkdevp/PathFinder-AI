import os, json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .generator import generate_ai_roadmap

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT") or "pathfinder-ai-477617"

app = FastAPI(title="PathFinder AI")

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequestModel(BaseModel):
    job_title: str

@app.get("/api/health")
def health():
    return {"status": "ok"}

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
