"""
SehatSetu Backend API (Unified).
Stateful workflow for ASHA field worker field prototype.
"""

import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta

# Add root backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import modules
from visioncare.inference import run_visioncare
from risksense.inference import score_patient_list

app = Flask(__name__)
CORS(app)

# In-memory session data for Demo
PATIENTS = {
    1: {
        "id": 1,
        "name": "Meena Devi",
        "age": 47,
        "village": "Rampur",
        "type": "maternal",
        "diagnosis_code": "diabetes",
        "bp_systolic": 158,
        "bp_diastolic": 95,
        "spo2": 96,
        "temperature": 98.6,
        "days_since_discharge": 18,
        "missed_visits": 2,
        "medication_adherence": 0.4,
        "is_pregnant": 1,
        "pregnancy_month": 6,
        "anc_missed": 2,
        "conditions": ["High-risk Pregnancy", "Type 2 Diabetes"],
        "lastVisit": "12 Apr 2025",
        "phone": "98XXXXXX01",
        "history": []
    },
    2: {
        "id": 2,
        "name": "Sunita Yadav",
        "age": 24,
        "village": "Baishpur",
        "type": "maternal",
        "diagnosis_code": "anemia",
        "bp_systolic": 102,
        "bp_diastolic": 68,
        "spo2": 92,
        "temperature": 98.4,
        "is_pregnant": 1,
        "pregnancy_month": 8,
        "anc_missed": 1,
        "conditions": ["Severe Anemia", "Pregnancy - 8 mo."],
        "lastVisit": "15 Apr 2025",
        "phone": "98XXXXXX02",
        "history": []
    },
    3: {
        "id": 3,
        "name": "Gopal Singh",
        "age": 62,
        "village": "Rampur",
        "type": "general",
        "diagnosis_code": "tb",
        "bp_systolic": 138,
        "bp_diastolic": 88,
        "spo2": 94,
        "temperature": 101.2,
        "missed_visits": 1,
        "medication_adherence": 0.5,
        "is_pregnant": 0,
        "conditions": ["Tuberculosis (Active)", "Elderly"],
        "lastVisit": "20 Apr 2025",
        "phone": "98XXXXXX03",
        "history": []
    },
    4: {
        "id": 4,
        "name": "Arjun Kumar",
        "age": 3,
        "village": "Sundarpur",
        "type": "child",
        "diagnosis_code": "malnutrition",
        "bp_systolic": 90,
        "bp_diastolic": 60,
        "spo2": 98,
        "temperature": 102.5,
        "is_pregnant": 0,
        "immunization_overdue": 1,
        "fever_days": 4,
        "conditions": ["Severe Fever", "Malnutrition"],
        "lastVisit": "28 Apr 2025",
        "phone": "98XXXXXX04",
        "history": []
    },
    5: {
        "id": 5,
        "name": "Lakshmi Bai",
        "age": 34,
        "village": "Nayagaon",
        "type": "general",
        "diagnosis_code": "routine",
        "bp_systolic": 116,
        "bp_diastolic": 76,
        "spo2": 99,
        "temperature": 98.2,
        "is_pregnant": 0,
        "conditions": ["Stable"],
        "lastVisit": "01 May 2025",
        "phone": "98XXXXXX05",
        "history": []
    }
}

REQUESTS = [
    {"id": 1, "name": "Meena Devi", "type": "Transport", "urgency": "High", "reason": "Hospital accompaniment for ANC", "status": "Pending", "village": "Rampur"},
    {"id": 2, "name": "Gopal Singh", "type": "Assistance", "urgency": "Medium", "reason": "PHC transport for TB meds", "status": "Pending", "village": "Rampur"},
    {"id": 3, "name": "Sunita Yadav", "type": "Emergency", "urgency": "Critical", "reason": "Delivery support request", "status": "Pending", "village": "Baishpur"}
]

@app.route('/api/patients', methods=['GET'])
def get_patients():
    patient_list = list(PATIENTS.values())
    scored_list = score_patient_list(patient_list)
    return jsonify({
        "success": True,
        "patients": scored_list,
        "metrics": {
            "total": len(PATIENTS),
            "critical": len([p for p in scored_list if p['level'] == 'CRITICAL']),
            "today_visits": len([p for p in patient_list if p['lastVisit'] == datetime.now().strftime("%d %b %Y")]),
            "pending_followups": len([p for p in scored_list if p['score'] > 50])
        }
    }), 200

@app.route('/api/patient/<int:pid>', methods=['GET'])
def get_patient(pid):
    patient = PATIENTS.get(pid)
    if not patient: return jsonify({"error": "Not found"}), 404
    scored = score_patient_list([patient])[0]
    return jsonify({"success": True, "patient": scored}), 200

@app.route('/api/register', methods=['POST'])
def register_patient():
    data = request.get_json()
    new_id = max(PATIENTS.keys()) + 1
    data['id'] = new_id
    data['lastVisit'] = "New Registration"
    data['history'] = []
    data['score'] = 0
    PATIENTS[new_id] = data
    return jsonify({"success": True, "patient_id": new_id}), 201

@app.route('/api/requests', methods=['GET'])
def get_requests():
    return jsonify({"success": True, "requests": REQUESTS}), 200

@app.route('/api/requests/<int:rid>/action', methods=['POST'])
def request_action(rid):
    data = request.get_json()
    for r in REQUESTS:
        if r['id'] == rid:
            r['status'] = data.get('status', 'Accepted')
            return jsonify({"success": True}), 200
    return jsonify({"error": "Not found"}), 404

@app.route('/api/visit', methods=['POST'])
def submit_visit():
    data = request.get_json()
    pid = int(data.get('patient_id'))
    if pid not in PATIENTS: return jsonify({"error": "Not found"}), 404
    p = PATIENTS[pid]
    for key in ['bp_systolic', 'bp_diastolic', 'spo2', 'temperature', 'medication_adherence', 'is_pregnant', 'anc_missed', 'immunization_overdue']:
        if key in data: p[key] = data[key]
    p['lastVisit'] = datetime.now().strftime("%d %b %Y")
    if data.get('anemia_result'): p['visioncare_result'] = data['anemia_result']
    p['history'].append({"date": p['lastVisit'], "type": "Field Visit", "notes": data.get('notes', "Visit completed.")})
    return jsonify({"success": True, "patient": score_patient_list([p])[0]}), 200

@app.route('/api/scan', methods=['POST'])
def scan():
    if 'image' in request.files:
        image_bytes = request.files['image'].read()
        return jsonify(run_visioncare(image_bytes)), 200
    return jsonify(run_visioncare(None)), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
