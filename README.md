````md
# 🚑 SehatSetu — AI-Assisted Rural Healthcare Workflow Platform

SehatSetu is a Proof-of-Concept healthcare workflow system designed for ASHA workers in rural India.

The platform combines:

- **RiskSense** → AI-powered patient prioritization
- **VisionCare** → Smartphone-based anemia screening
- **Visit Workflow System** → Maternal & child healthcare tracking
- **Scheduling & Follow-up Management**
- **Healthcare Assistance Requests**

The goal is to help frontline healthcare workers:
- identify high-risk patients earlier
- prioritize home visits
- monitor maternal & child health
- support anemia screening in low-resource environments

> ⚠️ VisionCare is a screening tool only and NOT a diagnostic replacement.

---

# 🧠 Core Modules

## 1. RiskSense
AI-assisted patient prioritization engine.

Features:
- Dynamic risk scoring
- Maternal risk alerts
- Follow-up prioritization
- Explainable AI reasoning
- Visit-based score recalculation
- High-risk patient tracking

Example AI reasons:
- High-risk pregnancy with missed ANC follow-up
- Severe anemia indicators detected
- Child immunization overdue
- Critically low SpO2 levels
- Persistent fever and missed visits

---

## 2. VisionCare
Smartphone-based anemia screening module.

Features:
- Lower eyelid image analysis
- CNN/EfficientNet model inference
- Anemia severity estimation
- Confidence scoring
- Referral recommendation
- Screening history tracking

Expected outputs:
- Normal
- Mild Anemia
- Moderate Anemia
- Severe Anemia

---

## 3. ASHA Worker Workflow
SehatSetu simulates realistic ASHA field workflows.

Includes:
- Home visit logging
- Maternal registration
- Child health tracking
- ANC monitoring
- Immunization tracking
- Referral assistance
- Follow-up scheduling
- Accompaniment requests

---

# 🏗️ Tech Stack

## Frontend
- React
- JSX
- Tailwind-style UI
- Mobile-first healthcare dashboard

## Backend
- Flask
- Flask-CORS

## AI/ML
### RiskSense
- XGBoost
- Scikit-learn

### VisionCare
- EfficientNet B3
- PyTorch / CNN pipeline

---

# 📂 Project Structure

```plaintext
sehatsetu/
│
├── frontend/                # React frontend
│
├── backend/
│   ├── api/                 # Unified Flask API
│   ├── risksense/           # Patient prioritization engine
│   └── visioncare/          # Anemia screening module
│
└── README.md
````

---

# 🚀 Running the Project

---

# 1️⃣ Setup Backend

Open terminal inside project root.

---

## A. Install VisionCare Dependencies

```bash
cd backend/visioncare
pip install -r requirements.txt
```

---

## B. Install RiskSense Dependencies

```bash
cd ../risksense
pip install flask flask-cors pandas scikit-learn xgboost
```

---

# 2️⃣ Initialize AI Models

Run once.

---

## A. Generate Synthetic Healthcare Data

```bash
cd ../risksense
python data/generate_data.py
```

---

## B. Train RiskSense Model

```bash
python model/train.py
```

This creates:

* trained XGBoost model
* synthetic patient prioritization engine

---

## C. Train VisionCare Model

```bash
cd ../visioncare
python train.py
```

This initializes:

* anemia screening model
* inference pipeline

---

# 3️⃣ Start Unified Backend API

```bash
cd ../api
python app.py
```

Backend runs on:

```plaintext
http://localhost:5000
```

---

# 💻 Setup Frontend

Open a NEW terminal.

---

## A. Install Frontend Dependencies

```bash
cd sehatsetu/frontend
npm install
```

---

## B. Start Frontend

```bash
npm start
```

Frontend runs on:

```plaintext
http://localhost:3000
```

---

# 🔬 Demo Features to Explore

## ✅ Dynamic Risk Scoring

RiskSense recalculates patient priority dynamically based on:

* visit completion
* maternal risk
* anemia screening
* missed follow-ups
* vitals & symptoms

---

## ✅ VisionCare AI Screening

Click:

```plaintext
Run Anemia Scan
```

to trigger:

* real model inference
* confidence scoring
* severity prediction

---

## ✅ ASHA Visit Workflow

ASHA workers can:

* conduct home visits
* record vitals
* update maternal data
* monitor child health
* schedule follow-ups

---

## ✅ Maternal & Child Health

Supports:

* pregnant woman registration
* ANC tracking
* immunization monitoring
* nutrition risk tracking
* referral assistance

---

## ✅ Assistance Requests

Patients can:

* request accompaniment
* request referral support
* request transport assistance

ASHA workers can:

* accept requests
* schedule follow-ups
* mark cases completed

---

# 🩺 Important Note

VisionCare is:

```plaintext
SCREENING TOOL ONLY
```

The system is intended to:

* assist healthcare workers
* support early intervention
* improve prioritization

It is NOT intended for:

* clinical diagnosis
* autonomous medical decision-making

---

# ⚡ Prototype Notes

This project is a hackathon Proof-of-Concept.

The app intentionally uses:

* synthetic healthcare data
* local mock state
* simplified workflows

The focus is:

* realistic healthcare workflow simulation
* explainable AI interaction
* polished frontend demo
* rural healthcare usability

---

# 🌍 Intended Impact

SehatSetu aims to support:

* ASHA workers
* PHCs
* rural clinics
* maternal healthcare programs
* early anemia screening efforts

Potential impact areas:

* earlier intervention
* reduced follow-up gaps
* improved maternal monitoring
* accessible rural screening workflows

---

# 👩‍⚕️ Built For

Frontline healthcare workers serving low-resource communities.

Designed with:

* simplicity
* accessibility
* mobile-first usability
* explainable AI assistance
  in mind.

```
```


## 🔬 What to Look For
1. **Dynamic Risk Scoring**: The dashboard list is fetched from the RiskSense XGBoost model.
2. **AI Anemia Screening**: Clicking "Scan for Anemia" on a patient profile triggers a real call to the VisionCare EfficientNet B3 model.
3. **Graceful Fallback**: If you stop the backend, the frontend will automatically use its internal hardcoded data to remain functional.
