# RiskSense

Patient risk prioritization module of SehatSetu. Scores post-discharge patients by risk level and generates a prioritized daily visit list for ASHA workers.

## Overview

RiskSense is a machine learning-powered healthcare module that predicts which post-discharge patients are at highest risk of missing their follow-up appointments. Using XGBoost classification, it scores patients on a 0-100 scale and provides explainable, clinician-friendly reasoning for prioritization decisions.

**Target Use Case:**  
ASHA workers receive a daily prioritized list of 5 highest-risk patients to visit, optimizing limited time and improving follow-up compliance.

---

## Project Structure

```
/backend/risksense
├── data/
│   ├── generate_data.py       # Synthetic data generator
│   └── patients.csv           # Generated training dataset (500 records)
├── model/
│   ├── train.py              # XGBoost model training
│   ├── model.pkl             # Trained model artifact
│   ├── encoders.pkl          # Label encoders for categorical features
│   ├── inference.py          # Model inference engine
│   └── reasons.py            # Explainability module
├── app.py                    # Flask REST API server
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

---

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
- pip package manager

### 2. Install Dependencies

```bash
cd /backend/risksense
pip install -r requirements.txt
```

**Installed Packages:**
- Flask 2.3.3 - REST API framework
- pandas 2.0.3 - Data manipulation
- numpy 1.24.3 - Numerical computing
- scikit-learn 1.3.0 - ML preprocessing
- xgboost 2.0.0 - Gradient boosting classifier
- joblib 1.3.1 - Model serialization

### 3. Generate Synthetic Training Data

```bash
python data/generate_data.py
```

**Output:**
- Creates `data/patients.csv` with 500 synthetic patient records
- Includes realistic health factors and risk labels
- Automatically split into 80% train / 20% test

**Generated Fields:**
| Field | Type | Range | Notes |
|-------|------|-------|-------|
| id | int | 1-500 | Patient identifier |
| name | str | Patient_1... | Auto-generated names |
| age | int | 18-85 | Years |
| diagnosis_code | str | E11, I10, J44, I50, E78, F41 | ICD-10 codes |
| bp_systolic | int | 90-200 | mmHg |
| spo2 | int | 80-100 | % |
| days_since_discharge | int | 1-60 | Days |
| missed_visits | int | 0-3 | Count |
| medication_adherence | float | 0.3-1.0 | Proportion |
| last_visit_gap_days | int | 1-90 | Days |
| target_risk | int | 0, 1 | Binary (1 = high risk) |

### 4. Train the Model

```bash
python model/train.py
```

**Output:**
- Trains XGBoost classifier
- Saves `model/model.pkl` (~500 KB)
- Saves `model/encoders.pkl` for categorical encoding
- Displays model performance metrics and feature importance

**Expected Performance:**
- Training Accuracy: ~85-90%
- Test Accuracy: ~80-85%
- Model handles imbalanced risk distribution

**Feature Importance (typical order):**
1. `last_visit_gap_days` - Most predictive of missed visits
2. `days_since_discharge` - Post-discharge vulnerability window
3. `medication_adherence` - Clinical compliance indicator
4. `missed_visits` - Historical missed appointment pattern

### 5. Test Inference

```bash
python model/inference.py
```

**Output:**
- Scores top 10 test patients
- Displays top 5 ranked by risk
- Shows individual reasons for prioritization

**Example Output:**
```
#1 - Patient_47 (ID: 47)
   Risk Score: 87/100 (CRITICAL)
   Reason: Missed 2 recent visits + Age 68 + Diagnosis: diabetes + BP elevated (168 mmHg) + Extended visit interval (72 days)

#2 - Patient_23 (ID: 23)
   Risk Score: 76/100 (HIGH)
   Reason: Missed 1 recent visit + Age 71 + Diagnosis: hypertension + BP critically elevated (178 mmHg) + Long post-discharge interval (48 days)
```

### 6. Launch the API Server

```bash
python app.py
```

**Server Output:**
```
==============================================================
RiskSense Patient Risk Prioritization API
==============================================================

✓ RiskSense inference engine initialized successfully

Starting Flask server...
API Documentation: http://localhost:5000
Health Check: http://localhost:5000/api/health
Sample Request: http://localhost:5000/api/sample

Press CTRL+C to stop the server
==============================================================
```

---

## API Documentation

### Base URL
```
http://localhost:5000
```

### Endpoints

#### 1. **GET / - API Documentation**
Returns information about all available endpoints and setup instructions.

**Response:**
```json
{
  "service": "RiskSense Patient Risk Prioritization API",
  "version": "1.0.0",
  "endpoints": {...}
}
```

---

#### 2. **GET /api/health - Health Check**
Verify API is running and responsive.

**Response:**
```json
{
  "status": "ok",
  "service": "RiskSense",
  "timestamp": "2024-01-15T10:30:00.123456"
}
```

**HTTP Status:** 200 OK

---

#### 3. **POST /api/riskscore - Score Patients** ⭐
Main endpoint: Score and prioritize patients by risk.

**Request Format:**
```json
{
  "patients": [
    {
      "id": 1,
      "name": "Rajesh Kumar",
      "age": 65,
      "diagnosis_code": "E11",
      "bp_systolic": 155,
      "spo2": 95,
      "days_since_discharge": 25,
      "missed_visits": 1,
      "medication_adherence": 0.7,
      "last_visit_gap_days": 35
    },
    {
      "id": 2,
      "name": "Priya Singh",
      "age": 72,
      "diagnosis_code": "I10",
      "bp_systolic": 168,
      "spo2": 92,
      "days_since_discharge": 40,
      "missed_visits": 2,
      "medication_adherence": 0.5,
      "last_visit_gap_days": 50
    }
  ]
}
```

**Response Format:**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:32:15.654321",
  "total_patients": 2,
  "top_5_prioritized": [
    {
      "rank": 1,
      "id": 2,
      "name": "Priya Singh",
      "score": 87,
      "risk_category": "CRITICAL",
      "reason": "Missed 2 recent visits + Age 72 + Diagnosis: hypertension + BP critically elevated (168 mmHg) + Long post-discharge interval (40 days)"
    },
    {
      "rank": 2,
      "id": 1,
      "name": "Rajesh Kumar",
      "score": 62,
      "risk_category": "HIGH",
      "reason": "Missed 1 recent visit + Age 65 + Diagnosis: type 2 diabetes + BP elevated (155 mmHg) + Extended visit interval (35 days)"
    }
  ]
}
```

**HTTP Status:**
- 200 OK - Scoring successful
- 400 Bad Request - Invalid payload
- 500 Internal Server Error - Model not initialized

---

#### 4. **GET /api/model/info - Model Information**
Get technical details about the trained model.

**Response:**
```json
{
  "model": "RiskSense Risk Prediction Model",
  "algorithm": "XGBoost Classifier",
  "target": "Probability of missing next follow-up visit",
  "features": [
    "diagnosis_code",
    "age",
    "bp_systolic",
    "spo2",
    "days_since_discharge",
    "missed_visits",
    "medication_adherence",
    "last_visit_gap_days"
  ],
  "output_range": "0-100 (risk score)",
  "version": "1.0.0"
}
```

---

#### 5. **GET /api/sample - Sample Request**
Get a sample payload to copy and test the API.

**Response:**
```json
{
  "description": "Sample POST request to /api/riskscore",
  "method": "POST",
  "endpoint": "/api/riskscore",
  "example_payload": {...}
}
```

---

## Testing the API

### Option 1: Using cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Score patients
curl -X POST http://localhost:5000/api/riskscore \
  -H "Content-Type: application/json" \
  -d '{
    "patients": [
      {
        "id": 1,
        "name": "Test Patient",
        "age": 65,
        "diagnosis_code": "E11",
        "bp_systolic": 150,
        "spo2": 95,
        "days_since_discharge": 20,
        "missed_visits": 1,
        "medication_adherence": 0.8,
        "last_visit_gap_days": 30
      }
    ]
  }'
```

### Option 2: Using Python

```python
import requests
import json

url = "http://localhost:5000/api/riskscore"

patients = [
    {
        "id": 1,
        "name": "Rajesh Kumar",
        "age": 65,
        "diagnosis_code": "E11",
        "bp_systolic": 155,
        "spo2": 95,
        "days_since_discharge": 25,
        "missed_visits": 1,
        "medication_adherence": 0.7,
        "last_visit_gap_days": 35
    }
]

response = requests.post(url, json={"patients": patients})
results = response.json()

for patient in results["top_5_prioritized"]:
    print(f"#{patient['rank']} - {patient['name']} (Risk: {patient['score']}/100)")
```

---

## Model Overview

### Architecture

**Algorithm:** XGBoost Classifier  
**Task:** Binary classification - Predict if patient will miss next follow-up visit  
**Input Features:** 8 patient risk factors  
**Output:** 0-100 risk score  

### Training Data

- **Records:** 500 synthetic patients
- **Features:** 10 (8 features + ID + target)
- **Class Balance:** ~60% low-risk, ~40% high-risk
- **Train/Test Split:** 80/20 stratified

### Feature Importance

1. `last_visit_gap_days` - Most predictive
2. `days_since_discharge` - Post-discharge vulnerability
3. `medication_adherence` - Compliance indicator
4. `missed_visits` - Historical pattern
5. `bp_systolic` - Vital abnormality
6. `age` - Demographics
7. `spo2` - Respiratory status
8. `diagnosis_code` - Diagnosis type

---

## PoC Limitations & Future Enhancements

### Current Limitations

1. **Synthetic Data:** Using generated data for PoC. Production requires real patient data (de-identified, HIPAA-compliant).

2. **Feature Set:** Limited to 8 key features. Should expand to include comorbidity count, transportation barriers, social support factors.

3. **Temporal Dynamics:** Static model. Should update with continuous retraining and feedback loops.

4. **Calibration:** Scores need threshold calibration against real outcomes.

### Future Enhancements

1. **Real Data Integration** - Connect to EHR systems
2. **Advanced Modeling** - Deep learning, ensemble methods
3. **Personalization** - Per-worker routing, geographic optimization
4. **Monitoring** - Performance tracking, data drift detection
5. **Deployment** - Docker, Kubernetes, CI/CD
6. **Feedback Loop** - Track outcomes, iterate model

---

## Troubleshooting

### "Model not found at model/model.pkl"

```bash
python model/train.py
```

### "Module not found: xgboost"

```bash
pip install -r requirements.txt
```

### "Address already in use" on port 5000

Change port in app.py or kill existing process.

---

## Quick Start (5 minutes)

```bash
pip install -r requirements.txt
python data/generate_data.py
python model/train.py
python app.py
```

Then test: `curl http://localhost:5000/api/health`

---

## Architecture Highlights

✓ Modular design - Separate data, model, and API layers  
✓ Explainability - Plain-English reasons for every score  
✓ Scalable - Handles batch scoring efficiently  
✓ Production-ready - Error handling, validation  
✓ Beginner-friendly - Clear comments and documentation  
✓ Hackathon-grade - Professional structure  

**Version:** 1.0.0 PoC | **Last Updated:** January 2024
