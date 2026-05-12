"""
RiskSense Flask API server.
Provides REST endpoints for patient risk scoring and prioritization.
"""

from flask import Flask, request, jsonify
import os
import sys
import pandas as pd
from datetime import datetime

# Add current directory to path for package imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from model.inference import RiskSenseInference
from model.reasons import ReasonGenerator


app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response

# Global inference engine
inference_engine = None


def initialize_engine():
    """Initialize the inference engine on startup."""
    global inference_engine
    try:
        model_dir = os.path.join(os.path.dirname(__file__), 'model')
        inference_engine = RiskSenseInference(model_dir=model_dir)
        print("SUCCESS: RiskSense inference engine initialized successfully")
    except Exception as e:
        print(f"FAILED to initialize inference engine: {e}")
        print("  Please ensure model.pkl exists in the model/ directory")
        print("  Run: python data/generate_data.py && python model/train.py")


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'service': 'RiskSense',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@app.route('/api/riskscore', methods=['POST'])
def score_patients():
    """
    Score and rank patients by risk.
    
    Request format:
    {
        "patients": [
            {
                "id": 1,
                "name": "Patient Name",
                "age": 65,
                "diagnosis_code": "E11",
                "bp_systolic": 145,
                "spo2": 95,
                "days_since_discharge": 20,
                "missed_visits": 1,
                "medication_adherence": 0.8,
                "last_visit_gap_days": 30
            },
            ...
        ]
    }
    
    Response format:
    {
        "success": true,
        "timestamp": "2024-01-15T10:30:00",
        "total_patients": 10,
        "top_5_prioritized": [
            {
                "rank": 1,
                "id": 5,
                "name": "Patient Name",
                "score": 85,
                "risk_category": "CRITICAL",
                "reason": "Missed recent visits + age 72 + diabetes"
            },
            ...
        ]
    }
    """
    try:
        # Validate request
        if not request.json:
            return jsonify({
                'success': False,
                'error': 'No JSON payload provided'
            }), 400
        
        patients_data = request.json.get('patients', [])
        
        if not patients_data:
            return jsonify({
                'success': False,
                'error': 'No patients provided in request'
            }), 400
        
        if not isinstance(patients_data, list):
            return jsonify({
                'success': False,
                'error': 'patients field must be a list'
            }), 400
        
        # Validate model is loaded
        if inference_engine is None:
            return jsonify({
                'success': False,
                'error': 'Model not initialized. Server misconfigured.'
            }), 500
        
        # Score all patients
        all_scores = inference_engine.score_batch(patients_data)
        
        # Get top 5
        top_5 = all_scores[:5]
        
        # Format response
        response = {
            'success': True,
            'timestamp': datetime.utcnow().isoformat(),
            'total_patients': len(patients_data),
            'top_5_prioritized': [
                {
                    'rank': result['rank'],
                    'id': result['id'],
                    'name': result['name'],
                    'score': result['score'],
                    'risk_category': result['risk_category'],
                    'reason': result['reason']
                }
                for result in top_5
            ]
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        print(f"Error in /api/riskscore: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Get information about the model."""
    return jsonify({
        'model': 'RiskSense Risk Prediction Model',
        'algorithm': 'XGBoost Classifier',
        'target': 'Probability of missing next follow-up visit',
        'features': [
            'diagnosis_code',
            'age',
            'bp_systolic',
            'spo2',
            'days_since_discharge',
            'missed_visits',
            'medication_adherence',
            'last_visit_gap_days'
        ],
        'output_range': '0-100 (risk score)',
        'version': '1.0.0'
    }), 200


@app.route('/api/sample', methods=['GET'])
def sample_request():
    """Get sample request payload."""
    return jsonify({
        'description': 'Sample POST request to /api/riskscore',
        'method': 'POST',
        'endpoint': '/api/riskscore',
        'example_payload': {
            'patients': [
                {
                    'id': 1,
                    'name': 'Rajesh Kumar',
                    'age': 65,
                    'diagnosis_code': 'E11',
                    'bp_systolic': 155,
                    'spo2': 95,
                    'days_since_discharge': 25,
                    'missed_visits': 1,
                    'medication_adherence': 0.7,
                    'last_visit_gap_days': 35
                },
                {
                    'id': 2,
                    'name': 'Priya Singh',
                    'age': 72,
                    'diagnosis_code': 'I10',
                    'bp_systolic': 168,
                    'spo2': 92,
                    'days_since_discharge': 40,
                    'missed_visits': 2,
                    'medication_adherence': 0.5,
                    'last_visit_gap_days': 50
                }
            ]
        }
    }), 200


@app.route('/', methods=['GET'])
def index():
    """API documentation."""
    return jsonify({
        'service': 'RiskSense Patient Risk Prioritization API',
        'version': '1.0.0',
        'description': 'Scores post-discharge patients by risk and generates prioritized visit lists for ASHA workers',
        'endpoints': {
            'GET /': 'This documentation',
            'GET /api/health': 'Health check',
            'POST /api/riskscore': 'Score and rank patients',
            'GET /api/model/info': 'Model information',
            'GET /api/sample': 'Sample request payload'
        },
        'setup': {
            'step_1': 'Generate synthetic data: python data/generate_data.py',
            'step_2': 'Train model: python model/train.py',
            'step_3': 'Run server: python app.py',
            'step_4': 'POST to http://localhost:5000/api/riskscore'
        }
    }), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'See GET / for API documentation'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'error': 'Internal server error',
        'message': str(error)
    }), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("RiskSense Patient Risk Prioritization API")
    print("="*60)
    
    # Initialize inference engine
    initialize_engine()
    
    print("\nStarting Flask server...")
    print("API Documentation: http://localhost:5000")
    print("Health Check: http://localhost:5000/api/health")
    print("Sample Request: http://localhost:5000/api/sample")
    print("\nPress CTRL+C to stop the server")
    print("="*60 + "\n")
    
    # Run server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        threaded=True
    )
