"""
YOLOv8 Fire and Smoke Detection FastAPI Microservice
Run with: python scripts/yolo_server.py or uvicorn scripts.yolo_server:app --port 8000
"""

import os
import sys
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.detect_fire_smoke import run_detection

app = FastAPI(title="CampusShield YOLOv8 Fire & Smoke Vision Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageDetectRequest(BaseModel):
    imageBase64: Optional[str] = None
    imagePath: Optional[str] = None
    confThreshold: Optional[float] = 0.15

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "YOLOv8s-Fire-Smoke",
        "repo": "https://github.com/Abonia1/YOLOv8-Fire-and-Smoke-Detection",
        "classes": ["Fire", "default", "smoke"]
    }

@app.post("/detect")
async def detect(req: ImageDetectRequest):
    img_input = req.imageBase64 or req.imagePath
    if not img_input:
        raise HTTPException(status_code=400, detail="No image provided")
    
    result = run_detection(img_input, conf_threshold=req.confThreshold or 0.15)
    return result

@app.post("/detect-upload")
async def detect_upload(file: UploadFile = File(...), conf: float = Form(0.15)):
    contents = await file.read()
    import base64
    b64_str = base64.b64encode(contents).decode('utf-8')
    result = run_detection(b64_str, conf_threshold=conf)
    return result

if __name__ == '__main__':
    uvicorn.run(app, host="127.0.0.1", port=8000)
