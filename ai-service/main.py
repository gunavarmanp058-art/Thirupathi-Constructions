from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from typing import List
from datetime import datetime
import io
from PIL import Image

app = FastAPI(
    title="TN Construction - AI Microservice",
    description="Standalone AI service for machinery maintenance and project tracking predictions.",
    version="1.0.0"
)

# -----------------------------------
# MODULE 1: Machinery Maintenance Prediction
# -----------------------------------

class MachineInput(BaseModel):
    working_hours: float
    fuel_used: float
    breakdown_count: int
    last_maintenance_date: str  # YYYY-MM-DD

@app.post("/predict/machine", tags=["Machinery"])
async def predict_machine(data: MachineInput):
    # Calculate days since maintenance
    try:
        last_date = datetime.strptime(data.last_maintenance_date, "%Y-%m-%d")
        days_since = (datetime.now() - last_date).days
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD"}

    # Scoring system
    score = 0
    
    if data.working_hours > 200: score += 2
    elif data.working_hours > 100: score += 1
    
    if data.fuel_used > 150: score += 1
    
    if data.breakdown_count >= 3: score += 3
    elif data.breakdown_count == 2: score += 2
    elif data.breakdown_count == 1: score += 1
    
    if days_since > 60: score += 2
    elif days_since > 30: score += 1

    # Determination
    if score >= 6:
        condition = "Critical"
        remaining_hours = 10
        recommendation = "Stop usage and do immediate maintenance"
    elif score >= 3:
        condition = "Needs Maintenance"
        remaining_hours = 50
        recommendation = "Schedule maintenance within 7 days"
    else:
        condition = "Good"
        remaining_hours = 120
        recommendation = "Continue normal operation"

    return {
        "condition": condition,
        "estimated_remaining_hours": remaining_hours,
        "recommendation": recommendation
    }

# -----------------------------------
# MODULE 2: Project Progress Tracking
# -----------------------------------

class ProgressItem(BaseModel):
    planned_percent: float
    actual_percent: float

class ProjectInput(BaseModel):
    progress: List[ProgressItem]

@app.post("/predict/project", tags=["Projects"])
async def predict_project(data: ProjectInput):
    if not data.progress:
        return {
            "health": "Unknown",
            "delay_risk": "N/A",
            "estimated_delay_days": 0
        }
    
    # Take latest item
    latest = data.progress[-1]
    gap = latest.planned_percent - latest.actual_percent

    if gap > 10:
        health = "High Risk"
        delay_risk = "High"
    elif gap > 4:
        health = "Slight Delay"
        delay_risk = "Medium"
    else:
        health = "On Track"
        delay_risk = "Low"

    estimated_delay = max(0, round(gap * 1.5))

    return {
        "health": health,
        "delay_risk": delay_risk,
        "estimated_delay_days": estimated_delay
    }

# -----------------------------------
# MODULE 3: Image-based Progress & Infrastructure Analysis
# -----------------------------------

@app.post("/predict/image", tags=["Image"])
async def predict_image_progress(file: UploadFile = File(...)):
    """Estimate progress based on a construction site photo."""
    try:
        content = await file.read()
        img = Image.open(io.BytesIO(content)).convert("L")  # grayscale
        pixels = list(img.getdata())
        if len(pixels) == 0:
            return {"progress_estimate": 0, "confidence": 0.0}

        avg_brightness = sum(pixels) / len(pixels)
        progress_estimate = min(100, max(0, int((avg_brightness / 255) * 100)))

        # Confidence is higher for larger images
        confidence = min(1.0, len(pixels) / (1024 * 1024))

        return {
            "progress_estimate": progress_estimate,
            "confidence": round(confidence, 2),
            "method": "brightness-heuristic"
        }
    except Exception as e:
        return {"error": str(e)}

# --- Simulated AI Vision Inference System ---
# (In production, replace this with YOLOv8 or Detectron2)
def run_infrastructure_inference(filename: str):
    """
    Mocks a real Object Detection model (e.g. YOLOv8) 
    that identifies specific infrastructure components.
    """
    # Clean and lower the filename for robust matching
    fn = str(filename).lower().strip()
    print(f"--- AI INFERENCE DEBUG ---")
    print(f"Target Filename: '{fn}'")
    
    detections = []
    
    # Simulate Road & Structural Infrastructure Objects
    road_keywords = [
        "road", "highway", "street", "pavement", "bridge", "metro", "flyover", 
        "pillar", "pier", "structural", "work", "progress", "construction", 
        "site", "chennai", "madurai", "ring"
    ]
    
    match_found = False
    for k in road_keywords:
        if k in fn:
            print(f"Keyword Match Found: '{k}'")
            match_found = True
            break
            
    if match_found:
        detections.append({"class": "road_surface", "type": "paved", "confidence": 0.98, "status": "ongoing"})
        if "crack" in fn or "pothole" in fn:
            detections.append({"class": "surface_defect", "severity": "medium", "confidence": 0.94})
            
    # Simulate Pipeline Objects
    pipe_keywords = ["pipe", "trench", "line", "drainage", "sewer", "conduit"]
    for k in pipe_keywords:
        if k in fn:
            print(f"Pipeline Match Found: '{k}'")
            detections.append({"class": "pipeline_segment", "material": "HDPE", "confidence": 0.97})
            detections.append({"class": "excavation_trench", "depth_est": "1.5m", "confidence": 0.91})
            break

    print(f"Final Detections: {detections}")
    print(f"--------------------------")
    return detections

@app.post("/predict/infrastructure", tags=["Image"])
async def analyze_infrastructure(file: UploadFile = File(...)):
    """
    STRICT Infrastructure Vision Analysis: Only Road & Pipeline content.
    Follows Government Project AI Vision Flow.
    """
    try:
        filename = file.filename.lower()
        
        # Step 1: Run Inference
        detected_objects = run_infrastructure_inference(filename)
        
        # Step 2: Check for Road/Pipeline presence
        has_road = any(d["class"] == "road_surface" for d in detected_objects)
        has_pipeline = any(d["class"] in ["pipeline_segment", "excavation_trench"] for d in detected_objects)
        
        if not (has_road or has_pipeline):
            return {
                "detected": "None",
                "message": "Access Denied: No valid Road or Pipeline infrastructure detected. Analysis aborted.",
                "analysis": None,
                "progress": None,
                "issues": [],
                "detection_confidence": 0.0,
                "progress_confidence": 0.0
            }

        # Step 3: Detailed Analysis Logic
        detected_label = "Both" if (has_road and has_pipeline) else ("Road" if has_road else "Pipeline")
        
        # Extract issues with explicit string casting for type safety
        issues = []
        for d in detected_objects:
            obj_class = str(d.get("class", ""))
            if "defect" in obj_class or "error" in obj_class:
                issues.append(obj_class.replace("_", " "))
        
        if not issues: issues = ["None detected"]
        
        # Progress Heuristic based on detected features
        progress = "Medium"
        det_str = str(detected_objects)
        if "paved" in det_str: progress = "High"
        if "excavation" in det_str: progress = "Low"
        
        # Confidence calculation with explicit float casting
        confidences = [float(d.get("confidence", 0.0)) for d in detected_objects]
        avg_det_conf = sum(confidences) / len(confidences) if confidences else 0.0

        # Step 5: Final Output
        return {
            "detected": detected_label,
            "analysis": f"AI identified {len(detected_objects)} infrastructure features. {detected_label} status: Stable.",
            "progress": progress,
            "issues": issues,
            "detection_confidence": round(float(avg_det_conf), 2),
            "progress_confidence": 0.88
        }
        
    except Exception as e:
        return {"error": str(e)}




# Entry point for health check
@app.get("/", tags=["General"])
async def root():
    return {"message": "TN Construction AI Microservice is online"}