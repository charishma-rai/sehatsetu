"""
SehatSetu Backend API (Simplified).
Connects VisionCare (rule-based) and RiskSense (XGBoost) modules.
"""

import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

# Add root backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import modules
from visioncare.inference import run_visioncare
from risksense.inference import score_patient_list

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'SehatSetu Unified API'
    }), 200

@app.route('/api/scan', methods=['POST'])
def scan():
    """VisionCare: Conjunctival pallor analysis."""
    print(f"DEBUG: Received scan request. Content-Type: {request.content_type}")
    
    # 1. Real Image Flow
    if 'image' in request.files:
        try:
            image_file = request.files['image']
            image_bytes = image_file.read()
            return jsonify(run_visioncare(image_bytes)), 200
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500
            
    # 2. Demo / JSON Flow
    try:
        data = request.get_json(silent=True) or {}
        patient_id = data.get('patient_id', 0)
        print(f"DEBUG: Demo scan for patient {patient_id}")
        
        result = {
            "success": True,
            "diagnosis": "Mild Anemia" if int(patient_id) % 2 == 0 else "No Anemia Detected",
            "confidence": 0.82,
            "action": "Refer to PHC" if int(patient_id) % 2 == 0 else "Continue monitoring",
            "level": "Mild" if int(patient_id) % 2 == 0 else "Normal",
            "note": "Simulated result for demo mode."
        }
        return jsonify(result), 200
    except Exception as e:
        print(f"ERROR in demo scan: {e}")
        return jsonify({"success": False, "error": "Invalid JSON or patient_id"}), 400

@app.route('/api/riskscore', methods=['POST'])
def risk_score():
    """RiskSense: Patient prioritization scoring."""
    print(f"DEBUG: Received riskscore request. Content-Type: {request.content_type}")
    
    try:
        data = request.get_json(silent=True) or {}
        patients = data.get('patients', [])
        
        # If no patients provided, use default sample for demo
        if not patients:
            print("DEBUG: Using default sample patients for RiskSense")
            patients = [
                {"id": 101, "name": "A. Sharma", "age": 45, "missed_visits": 2, "medication_adherence": 0.6, "bp_systolic": 155},
                {"id": 102, "name": "B. Patel", "age": 62, "missed_visits": 0, "medication_adherence": 0.9, "bp_systolic": 135},
                {"id": 103, "name": "C. Singh", "age": 28, "missed_visits": 1, "medication_adherence": 0.8, "bp_systolic": 120, "is_pregnant": True},
            ]
            
        scored_list = score_patient_list(patients)
        return jsonify({
            "success": True,
            "patients": scored_list
        }), 200
    except Exception as e:
        print(f"ERROR in riskscore: {e}")
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    # Flask port 5000 as requested
    app.run(host='0.0.0.0', port=5000, debug=False)
