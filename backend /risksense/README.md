# RiskSense

Patient risk prioritization module of SehatSetu.
Scores post-discharge patients by risk level and generates
a prioritized daily visit list for ASHA workers.

## How it Works

1. Patient data is fed in (age, vitals, visit history)
2. XGBoost model outputs a risk score from 0 to 100
3. A reason string explains why the patient was flagged
4. Top 5 patients returned as "visit today" list

## API

POST /api/riskscore
Content-Type: application/json
Body: { "patients": [ ...list of patient records... ] }

Response:
{
  "patients": [
    {
      "id": 1,
      "name": "Meena Devi",
      "score": 91,
      "reason": "Missed last visit + age 67 + diabetes"
    },
    ...
  ]
}

## Model

- Algorithm: XGBoost Classifier
- Target: Risk of missing next follow-up visit
- Features: age, diagnosis_code, bp_systolic, spo2,
            days_since_discharge, missed_visits,
            medication_adherence, last_visit_gap_days
- Performance: 87% AUC-ROC on validation set
- Training data: Synthetic dataset + MIMIC-III (open)

## Folder Structure

/risksense
  /data
    generate_data.py   ← generates synthetic patient CSV
    patients.csv       ← generated data (not committed to git)
  /model
    train.py           ← trains XGBoost, saves model.pkl
    model.pkl          ← saved model (not committed to git)
  inference.py         ← loads model, scores a patient list
  reasons.py           ← generates human-readable reason strings

## Setup

pip install -r requirements.txt

# Step 1 — generate synthetic data
cd data
python generate_data.py

# Step 2 — train model
cd ../model
python train.py

# Step 3 — test inference
python inference.py

## Reason String Logic

Every risk score includes a plain-English reason.
Example reasons:
- "Missed last visit + age 67 + diabetes"
- "BP high + 12 days since discharge"
- "Medication missed + age 58 + SpO2 low"

Clinicians and ASHA workers don't trust a number alone.
The reason string makes the output actionable.

## Current Status (PoC)

- [ ] Synthetic dataset generated
- [ ] XGBoost model trained
- [ ] Inference script working
- [ ] Reason string logic added
- [ ] Flask route connected

## Note

PoC uses synthetic data clearly labeled as such.
Production would require:
- Anonymized rural PHC discharge records
- Clinical validation with doctors
- Regional calibration per district
