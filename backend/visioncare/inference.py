"""
VisionCare: AI-Powered Anemia Screening.
Uses a trained MobileNetV3 model to analyze conjunctival images.
Falls back to rule-based analysis if model is unavailable.
"""

import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import cv2
import numpy as np

# Path to model artifact
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'visioncare_model.pth')

class VisionCareModel(nn.Module):
    """Architecture matching the training script."""
    def __init__(self):
        super(VisionCareModel, self).__init__()
        self.model = models.mobilenet_v3_small(weights=None)
        num_ftrs = self.model.classifier[3].in_features
        self.model.classifier[3] = nn.Linear(num_ftrs, 3)

    def forward(self, x):
        return self.model(x)

def run_visioncare(image_bytes):
    """
    Entry point for VisionCare analysis.
    Tries AI model first, falls back to rule-based logic.
    """
    if os.path.exists(MODEL_PATH):
        try:
            return _predict_with_model(image_bytes)
        except Exception as e:
            print(f"AI Model failed, using rule-based fallback: {e}")
            return _run_rule_based(image_bytes)
    else:
        print("Model file not found, using rule-based analysis.")
        return _run_rule_based(image_bytes)

def _predict_with_model(image_bytes):
    """Perform inference using the trained PyTorch model."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Load model
    model = VisionCareModel()
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model = model.to(device)
    model.eval()

    # Preprocess image
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    img_tensor = transform(image).unsqueeze(0).to(device)

    # Inference
    with torch.no_grad():
        outputs = model(img_tensor)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        confidence, predicted = torch.max(probabilities, 0)
    
    class_idx = predicted.item()
    conf_val = confidence.item()
    
    # Mapping
    results = {
        0: {"diagnosis": "No Anemia Detected", "level": "Normal", "action": "Continue routine monitoring"},
        1: {"diagnosis": "Mild Anemia", "level": "Mild", "action": "Refer to PHC + iron supplements"},
        2: {"diagnosis": "Moderate/Severe Anemia", "level": "Severe", "action": "URGENT: Refer to PHC immediately"}
    }
    
    res = results[class_idx]
    return {
        "success": True,
        "diagnosis": res["diagnosis"],
        "confidence": round(conf_val, 2),
        "action": res["action"],
        "level": res["level"],
        "note": "AI model analysis complete (Trained on India/Italy datasets)."
    }

def _run_rule_based(image_bytes):
    """Fallback rule-based logic (LAB color space)."""
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None: return _get_error("Decode failed")
        
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        h, w = a.shape
        crop = a[h//3:2*h//3, w//3:2*w//3]
        avg_a = np.mean(crop)
        score = np.clip((avg_a - 128) / (160 - 128), 0, 1)
        
        if score > 0.7:
            return {"success": True, "diagnosis": "No Anemia Detected", "confidence": 0.85, "action": "Routine monitoring", "level": "Normal", "note": "Rule-based analysis result."}
        elif score > 0.4:
            return {"success": True, "diagnosis": "Mild Anemia", "confidence": 0.65, "action": "Iron supplements", "level": "Mild", "note": "Rule-based analysis result."}
        else:
            return {"success": True, "diagnosis": "Moderate/Severe Anemia", "confidence": 0.80, "action": "URGENT: Refer to PHC", "level": "Severe", "note": "Rule-based analysis result."}
    except Exception as e:
        return _get_error(str(e))

def _get_error(msg):
    return {"success": False, "diagnosis": "Analysis Error", "confidence": 0.0, "action": "Retry scan", "level": "Unknown", "note": msg}
