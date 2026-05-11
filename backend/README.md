# SehatSetu — Backend

Python backend for SehatSetu. Exposes REST APIs for two AI modules:
VisionCare (anemia screening) and RiskSense (patient risk scoring).

## Structure

/backend
  /visioncare      ← anemia detection module
  /risksense       ← patient risk prioritization module
  /api             ← Flask routes connecting both modules
  requirements.txt

## Modules

### VisionCare
CNN-based anemia screening from conjunctiva images.
- Input: image (inner lower eyelid photo)
- Output: anemia status + confidence score
- Model: EfficientNet B3

### RiskSense
XGBoost-based post-discharge risk scoring for ASHA workers.
- Input: patient data (age, vitals, visit history)
- Output: risk score (0–100) + reason string
- Generates prioritized daily visit list

## Setup

pip install -r requirements.txt
cd api
python app.py

## API Endpoints

POST /api/scan        → VisionCare anemia result
POST /api/riskscore   → RiskSense patient priority list
GET  /api/health      → server status check

## Status

VisionCare   → in progress
RiskSense    → in progress
Flask API    → mock ready

## Note
PoC prototype. Models trained on synthetic/open datasets.
Not for clinical use.
