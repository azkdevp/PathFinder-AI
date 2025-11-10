# 🧭 PathFinder AI

**AI-Powered Skill Roadmaps for the Future Workforce**

PathFinder AI helps individuals and organizations map out personalized learning and career growth paths using **Google Vertex AI (Gemini 2.5 Flash)**.
Built on **FastAPI** and deployed on **Google Cloud Run**, it generates instant, data-driven skill roadmaps — transforming how students, job-seekers, and employers approach reskilling.


## 🚀 Key Features

* **AI Skill Mapping:** Instantly generate 10-skill roadmaps for any role (e.g., *Data Scientist*, *UX Designer*, *Cybersecurity Analyst*).
* **Curated Learning Paths:** Fetches top free courses from verified platforms (Coursera, edX, Google Digital Garage).
* **Smart Insights:** Estimates duration (3–9 months) and U.S. salary range for each career path.
* **Zero Setup Frontend:** Lightweight HTML + TailwindCSS interface with animated “glass-morphism” UI.
* **Cloud Native:** Fully containerized; deploys to **Google Cloud Run** with Pub/Sub workers and Cloud Storage integration.


## 🧠 Architecture Overview

```
User (Browser)
   │
   ▼
Frontend (HTML / CSS / JS)
   │   REST / JSON
   ▼
FastAPI Backend (Cloud Run)
   │
   ├─► Vertex AI Gemini 2.5 Flash  →  Skill Roadmap JSON
   │
   ├─► Pub/Sub Worker (async job refresh)
   │
   └─► Cloud Storage (cache & static assets)
          └─► Cloud Build (CI/CD pipeline)
```

> Fully stateless architecture; scales automatically with demand.


## ⚙️ Tech Stack

| Layer              | Technology                          |
| :----------------- | :---------------------------------- |
| **Frontend**       | HTML 5 / TailwindCSS / Vanilla JS   |
| **Backend**        | FastAPI  ·  Python 3.10             |
| **AI Model**       | Vertex AI Gemini 2.5 Flash          |
| **Deployment**     | Google Cloud Run + Cloud Build      |
| **Data Transport** | REST API (JSON) + Pub/Sub           |
| **Storage**        | Google Cloud Storage (bucket cache) |


## 💡 Example API Usage

```bash
curl -X POST https://pathfinder.example.com/api/generate \
     -H "Content-Type: application/json" \
     -d '{"job_title": "Data Scientist"}'
```

**Response**

```json
{
  "role": "Data Scientist",
  "skills": ["Python", "Machine Learning", "Data Visualization", "..."],
  "courses": [
    {"title": "Machine Learning – Stanford Online", "url": "https://coursera.org/..."}
  ],
  "duration_months": 6,
  "avg_salary_usd": "$95k – $130k",
  "ai_generated": true
}
```

## 🧩 Project Structure

```
/pathfinder-ai
│
├── main.py             # FastAPI entrypoint
├── generator.py        # Gemini prompt and data generation
├── requirements.txt    # Dependencies
│
├── static/
│   ├── index.html      # Frontend
│   ├── css/style.css   # UI styles
│   └── js/main.js      # API integration
│
└── data/
    └── jobs.json       # Cached job templates
```


## 📈 Impact & Use Cases

* **Students & Graduates:** Identify key skills for their desired roles and free learning resources.
* **Career Switchers:** Receive tailored transition plans with estimated time and salary outlook.
* **Employers / HR:** Generate skill maps to guide internal training and promotion pathways.

> 58 % of U.S. workers plan to change careers in the next year (HR Dive 2023).
> PathFinder AI helps turn that uncertainty into actionable insight.


## 🛠️ Local Development

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/pathfinder-ai.git
cd pathfinder-ai

# 2. Create virtual environment
python3 -m venv venv && source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run locally
uvicorn main:app --reload --port 8080
```


## 🌐 Deployment

* Build container with Cloud Build:
  `gcloud builds submit --tag gcr.io/<PROJECT_ID>/pathfinder`
* Deploy to Cloud Run:
  `gcloud run deploy pathfinder --image gcr.io/<PROJECT_ID>/pathfinder --platform managed`


## 📄 License

Distributed under the MIT License. See `LICENSE` for details.


**© 2025 PathFinder AI · All rights reserved · Built by Azkhan**
