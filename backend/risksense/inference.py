"""
RiskSense: Brain of the SehatSetu Workflow.
Realistic clinical prioritization for ASHA workers.
"""

import os
import joblib

def score_patient_list(patients):
    scored_patients = []
    for p in patients:
        scored_p = p.copy()
        score = _calculate_hackathon_score(p)
        scored_p['score'] = int(score)
        scored_p['level'] = _get_level(score)
        scored_p['reason'] = _generate_believable_reason(p, score)
        scored_patients.append(scored_p)
    
    # Primary Sort: Score, then Urgency markers
    scored_patients.sort(key=lambda x: (x['score'], x.get('is_pregnant', 0), x.get('fever_days', 0)), reverse=True)
    return scored_patients

def _calculate_hackathon_score(p):
    score = 0
    
    # 1. Maternal & Pregnancy Factors
    if p.get('is_pregnant'):
        score += 25  # Base pregnancy risk
        if p.get('anc_missed', 0) > 0:
            score += 15 # Missed ANC is high priority
        if p.get('bp_systolic', 120) > 140:
            score += 15 # Hypertension in pregnancy
            
    # 2. VisionCare Anemia Results
    vc = p.get('visioncare_result', '')
    if "Severe" in vc: score += 20
    elif "Moderate" in vc: score += 15
    elif "Mild" in vc: score += 5

    # 3. Child Health Red Flags
    if p.get('age', 0) < 12: # Child
        if p.get('immunization_overdue'): score += 12
        if p.get('fever_days', 0) > 3: score += 10
        if p.get('diagnosis_code') == 'malnutrition': score += 5

    # 4. Critical Vitals
    if p.get('spo2', 100) < 93: score += 15
    if p.get('temperature', 98.6) > 101: score += 10
    if p.get('bp_systolic', 120) > 160: score += 10

    # 5. Adherence & Follow-up
    if p.get('missed_visits', 0) >= 2: score += 10
    if p.get('medication_adherence', 1.0) < 0.6: score += 8
    if p.get('referral_pending'): score += 7

    # 6. Demographics
    if p.get('age', 0) > 60: score += 8

    # Reductions
    if p.get('lastVisit') == "New Registration": score = max(score, 40) # Ensure new ones get seen
    
    return min(100, max(0, score))

def _generate_believable_reason(p, score):
    reasons = []
    
    if p.get('is_pregnant'):
        if p.get('anc_missed', 0) > 0: reasons.append("High-risk pregnancy + missed ANC follow-up")
        elif p.get('bp_systolic', 120) > 140: reasons.append("Maternal hypertension risk")
        else: reasons.append("Routine maternal monitoring")
        
    if "Anemia" in p.get('visioncare_result', ''):
        reasons.append(f"{p['visioncare_result'].split('(')[0].strip()} indicators from VisionCare")

    if p.get('immunization_overdue'):
        reasons.append("Child immunization overdue")
        
    if p.get('fever_days', 0) > 3:
        reasons.append("Persistent fever (>3 days)")

    if p.get('spo2', 100) < 93:
        reasons.append("SPO2 critically low during visit")

    if p.get('age', 0) > 60 and p.get('diagnosis_code') == 'diabetes':
        reasons.append("Elderly diabetic patient requiring follow-up")

    if not reasons:
        if score > 40: return "Multiple risk markers requiring attention."
        return "Stable profile; routine screening."

    return " & ".join(reasons[:2])

def _get_level(score):
    if score >= 76: return "CRITICAL"
    if score >= 51: return "HIGH"
    if score >= 26: return "MODERATE"
    return "LOW"
