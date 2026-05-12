"""
VisionCare Flask API server.
Provides endpoint for anemia screening from conjunctiva images.
"""

import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime
import numpy as np
import cv2

# Import local modules
from normalize import preprocess_for_inference
from inference import VisionCareInference

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'temp_uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
MODEL_PATH = os.path.join('model', 'visioncare_model.pth')

# Initialize inference engine
inference_engine = None

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response

def initialize_engine():
    global inference_engine
    try:
        inference_engine = VisionCareInference(model_path=MODEL_PATH)
        print("SUCCESS: VisionCare inference engine initialized")
    except Exception as e:
        print(f"FAILED to initialize VisionCare engine: {e}")

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'VisionCare',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@app.route('/api/scan', methods=['POST'])
def scan_image():
    """
    Scan conjunctiva image for anemia.
    Expects 'image' file in multipart/form-data.
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Preprocess
        processed_img = preprocess_for_inference(filepath)
        
        # Predict
        if inference_engine is None:
            return jsonify({'error': 'Model not initialized'}), 500
            
        result = inference_engine.predict(processed_img)
        
        # Clean up
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'timestamp': datetime.utcnow().isoformat(),
            **result
        }), 200
        
    except Exception as e:
        print(f"Error during scan: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'service': 'VisionCare Anemia Screening API',
        'version': '1.0.0',
        'endpoints': {
            'GET /api/health': 'Health check',
            'POST /api/scan': 'Analyze conjunctiva image'
        }
    }), 200

if __name__ == '__main__':
    initialize_engine()
    app.run(host='0.0.0.0', port=5001, debug=False)
