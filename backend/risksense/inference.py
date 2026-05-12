"""
RiskSense: Patient Risk Prioritization.
Uses XGBoost to score patients based on clinical and adherence markers.
Includes rule-based fallback and plain-English reason generation.
"""

import os
import joblib
import pandas as pd
import numpy as np

# Path to model artifact
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'model.pkl')
ENCODER_PATH = os.path.join(os.path.dirname(__file__), 'model', 'encoders.pkl')

def score_patient_list(patients):
    """
    Score a list of patients and return them with risk levels and reasons.
    Entry point for the API.
    """
    # Load model and encoders
    model = None
    encoders = None
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            if os.path.exists(ENCODER_PATH):
                encoders = joblib.load(ENCODER_PATH)
        except Exception as e:
            print(f"Error loading RiskSense model: {e}")

    scored_patients = []
    for p in patients:
        # Preserve all original fields
        scored_p = p.copy()
        
        # Calculate score
        if model:
            score = _predict_with_model(model, encoders, p)
        else:
            score = _rule_based_score(p)
            
        scored_p['score'] = int(score)
        scored_p['level'] = _get_level(score)
        scored_p['reason'] = build_reason(p)
        
        scored_patients.append(scored_p)
        
    # Sort by score descending
    scored_patients.sort(key=lambda x: x['score'], reverse=True)
    return scored_patients

def build_reason(p):
    """Generate plain-English reason strings from patient fields."""
    reasons = []
    
    if p.get('missed_visits', 0) > 1:
        reasons.append(f"Missed {p['missed_visits']} visits")
    elif p.get('missed_visits', 0) == 1:
        reasons.append("Missed last visit")
        
    if p.get('medication_adherence', 1.0) < 0.8:
        reasons.append("Inconsistent medication")
        
    if p.get('days_since_discharge', 0) > 30:
        reasons.append(f"{p['days_since_discharge']} days since discharge")
        
    if p.get('bp_systolic', 120) > 140:
        reasons.append("BP high")
        
    if p.get('spo2', 100) < 94:
        reasons.append("Oxygen levels low")
        
    if p.get('is_pregnant'):
        reasons.append("Pregnancy follow-up")

    if not reasons:
        return "Stable condition; routine monitoring."
        
    return " + ".join(reasons[:3]) # Limit to top 3 reasons

def _predict_with_model(model, encoders, p):
    """Internal helper to use the XGBoost model."""
    try:
        # Prepare features in the exact order used during training
        features = ['age', 'diagnosis_code', 'bp_systolic', 'spo2', 
                   'days_since_discharge', 'missed_visits', 
                   'medication_adherence', 'last_visit_gap_days']
        
        data = p.copy()
        
        # Encode diagnosis if possible
        if encoders and 'diagnosis_code' in encoders and 'diagnosis_code' in data:
            try:
                data['diagnosis_code'] = encoders['diagnosis_code'].transform([data['diagnosis_code']])[0]
            except:
                data['diagnosis_code'] = 0
        else:
            data['diagnosis_code'] = 0 # Fallback for unknown/missing
            
        # Ensure all features exist
        input_data = []
        for f in features:
            input_data.append(float(data.get(f, 0)))
            
        # Predict probability
        prob = model.predict_proba([input_data])[0][1]
        return round(prob * 100)
    except Exception as e:
        print(f"Model prediction failed: {e}. Falling back to rules.")
        return _rule_based_score(p)

def _rule_based_score(p):
    """Heuristic scoring if model is unavailable."""
    score = 0
    score += p.get('missed_visits', 0) * 20
    score += (1.0 - p.get('medication_adherence', 1.0)) * 50
    if p.get('bp_systolic', 120) > 150: score += 20
    if p.get('spo2', 100) < 92: score += 30
    if p.get('is_pregnant'): score += 15
    return min(100, score)

def _get_level(score):
    if score >= 80: return "CRITICAL"
    if score >= 50: return "HIGH"
    if score >= 30: return "MEDIUM"
    return "LOW"
