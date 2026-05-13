"""
VisionCare: AI-Powered Anemia Screening.
Connects real trained MobileNetV3 model with rule-based fallback.
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
    """Architecture used during training: MobileNetV3-Small."""
    def __init__(self):
        super(VisionCareModel, self).__init__()
        # Initialize with weights=None as per user instruction
        self.model = models.mobilenet_v3_small(weights=None)
        num_ftrs = self.model.classifier[3].in_features
        # Replace final layer with 3 classes
        self.model.classifier[3] = nn.Linear(num_ftrs, 3)

    def forward(self, x):
        return self.model(x)

# Initialize device and model globally
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_GLOBAL_MODEL = None

def load_model():
    """Load the trained model artifact."""
    global _GLOBAL_MODEL
    if os.path.exists(MODEL_PATH):
        try:
            model = VisionCareModel()
            model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
            model.to(DEVICE)
            model.eval()
            _GLOBAL_MODEL = model
            print(f"SUCCESS: VisionCare CNN model loaded on {DEVICE}")
        except Exception as e:
            print(f"ERROR: Failed to load CNN model: {e}")
            _GLOBAL_MODEL = None
    else:
        print(f"WARNING: Model file not found at {MODEL_PATH}")

# Load model on startup
load_model()

def run_visioncare(image_bytes=None):
    """
    Main entry point for VisionCare analysis.
    1. Check for demo mode (no bytes)
    2. Try AI model
    3. Fall back to rule-based logic
    """
    # 4. If no image bytes provided at all
    if not image_bytes:
        return {
            "success": True,
            "diagnosis": "Mild Anemia",
            "confidence": 0.85,
            "action": "Refer for blood test + iron supplementation advised",
            "level": "mild",
            "demo_mode": True,
            "note": "Demo mode: No image provided."
        }

    # Try AI model first
    if _GLOBAL_MODEL is not None:
        try:
            return _predict_with_model(image_bytes)
        except Exception as e:
            print(f"AI Inference failed, falling back: {e}")
            return _run_rule_based(image_bytes)
    
    # Fallback to rule-based
    return _run_rule_based(image_bytes)

def _predict_with_model(image_bytes):
    """Perform inference using the trained PyTorch model."""
    # Preprocess image
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # ImageNet stats normalization
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    img_tensor = transform(image).unsqueeze(0).to(DEVICE)

    # Run through model
    with torch.no_grad():
        outputs = _GLOBAL_MODEL(img_tensor)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        confidence, predicted = torch.max(probabilities, 0)
    
    class_idx = predicted.item()
    conf_val = round(confidence.item(), 2)
    
    # Mapping
    # 0=Normal, 1=Mild Anemia, 2=Moderate Anemia
    mapping = {
        0: {
            "diagnosis": "Normal",
            "level": "normal",
            "action": "Continue routine monitoring"
        },
        1: {
            "diagnosis": "Mild Anemia",
            "level": "mild",
            "action": "Refer for blood test + iron supplementation advised"
        },
        2: {
            "diagnosis": "Moderate Anemia",
            "level": "severe",
            "action": "Refer to PHC immediately for CBC test"
        }
    }
    
    res = mapping.get(class_idx, mapping[0])
    
    return {
        "success": True,
        "diagnosis": res["diagnosis"],
        "confidence": conf_val,
        "action": res["action"],
        "level": res["level"],
        "model": "MobileNetV3 (trained on conjunctiva images)",
        "note": "AI-assisted screening tool. Clinical judgment applies."
    }

def _run_rule_based(image_bytes):
    """Fallback rule-based pallor analysis using OpenCV LAB color space."""
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None: 
            return {"success": False, "error": "Could not decode image"}
        
        # LAB color space analysis for pallor (Redness in 'a' channel)
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        # Center crop for conjunctiva analysis
        h, w = a.shape
        crop = a[h//3:2*h//3, w//3:2*w//3]
        avg_a = np.mean(crop)
        
        # Simplified scoring based on 'a' channel (redness)
        # avg_a typically around 128 for neutral, higher is redder (normal)
        score = np.clip((avg_a - 128) / (160 - 128), 0, 1)
        
        if score > 0.7:
            return {
                "success": True, 
                "diagnosis": "Normal", 
                "confidence": 0.85, 
                "action": "Continue routine monitoring", 
                "level": "normal", 
                "note": "Rule-based analysis result (Pallor analysis)."
            }
        elif score > 0.4:
            return {
                "success": True, 
                "diagnosis": "Mild Anemia", 
                "confidence": 0.65, 
                "action": "Refer for blood test + iron supplementation advised", 
                "level": "mild", 
                "note": "Rule-based analysis result (Pallor analysis)."
            }
        else:
            return {
                "success": True, 
                "diagnosis": "Moderate Anemia", 
                "confidence": 0.80, 
                "action": "Refer to PHC immediately for CBC test", 
                "level": "severe", 
                "note": "Rule-based analysis result (Pallor analysis)."
            }
    except Exception as e:
        return {
            "success": False, 
            "diagnosis": "Analysis Error", 
            "confidence": 0.0, 
            "action": "Retry scan", 
            "level": "unknown", 
            "note": str(e)
        }

# For backward compatibility if any module expects VisionCareInference class
class VisionCareInference:
    def predict(self, img_rgb):
        # Convert numpy RGB to bytes to use the logic above
        is_success, buffer = cv2.imencode(".jpg", cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR))
        return run_visioncare(buffer.tobytes())
