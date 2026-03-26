# AI Microservice - TN Construction Platform

Standalone AI service built with Python and FastAPI for a construction management platform.

## Features
- **Machinery Maintenance Prediction**: Score-based health assessment.
- **Project Progress Tracking**: Delay risk analysis based on planned vs actual milestones.
- **Auto-generated Swagger**: Interactive API docs at `/docs`.

## Tech Stack
- Python 3.x
- FastAPI
- Pydantic
- Uvicorn

## How to Run
1. Navigate to the `ai-service` folder.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the service:
   ```bash
   uvicorn main:app --reload --port 8001
   ```

## Example CURL Requests

### 1. Machinery Maintenance Prediction
```bash
curl -X POST "http://localhost:8001/predict/machine" \
     -H "Content-Type: application/json" \
     -d '{
           "working_hours": 250,
           "fuel_used": 180,
           "breakdown_count": 2,
           "last_maintenance_date": "2023-12-01"
         }'
```

### 2. Project Progress Tracking
```bash
curl -X POST "http://localhost:8001/predict/project" \
     -H "Content-Type: application/json" \
     -d '{
           "progress": [
             {"planned_percent": 20, "actual_percent": 18},
             {"planned_percent": 40, "actual_percent": 35},
             {"planned_percent": 60, "actual_percent": 45}
           ]
         }'
```

---
Interactive docs available at: [http://localhost:8001/docs](http://localhost:8001/docs)
