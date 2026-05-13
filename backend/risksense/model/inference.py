"""
Perform inference on new patients using trained RiskSense model.
Scores patients and ranks them by risk level for ASHA worker prioritization.
"""

import pandas as pd
import numpy as np
import joblib
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from model.reasons import ReasonGenerator
from data.generate_data import generate_synthetic_data


class RiskSenseInference:
    """Load model and perform inference on patients."""
    
    def __init__(self, model_dir=None):
        """
        Initialize inference engine.
        
        Parameters:
        -----------
        model_dir : str
            Directory containing model.pkl and encoders.pkl
        """
        if model_dir is None:
            model_dir = os.path.dirname(__file__)
        
        self.model_dir = model_dir
        self.model = None
        self.encoders = None
        self.reason_gen = ReasonGenerator()
        
        self._load_model()
    
    def _load_model(self):
        """Load trained model and encoders from disk."""
        model_path = os.path.join(self.model_dir, 'model.pkl')
        encoders_path = os.path.join(self.model_dir, 'encoders.pkl')
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        print(f"Loading model from {model_path}...")
        self.model = joblib.load(model_path)
        
        if os.path.exists(encoders_path):
            print(f"Loading encoders from {encoders_path}...")
            self.encoders = joblib.load(encoders_path)
        else:
            self.encoders = {}
        
        print("Model loaded successfully")
    
    def load_patient_data(self, n_patients=100):
        """
        Load patient data for inference.
        
        Parameters:
        -----------
        n_patients : int
            Number of patients to load/generate
        
        Returns:
        --------
        pd.DataFrame
            Patient data
        """
        # Generate synthetic patient data
        patients_df = generate_synthetic_data(n_samples=n_patients)
        return patients_df
    
    def predict_risk_scores(self, patients_df):
        """
        Predict risk scores for all patients.
        
        Parameters:
        -----------
        patients_df : pd.DataFrame
            Patient data
        
        Returns:
        --------
        pd.DataFrame
            Patients with predicted scores
        """
        # Preprocess all patients
        processed_data = []
        for _, patient in patients_df.iterrows():
            patient_dict = patient.to_dict()
            features_df, patient_id, patient_name = self.preprocess_patient(patient_dict)
            processed_data.append((features_df, patient_id, patient_name, patient_dict))
        
        # Predict scores
        scores = []
        for features_df, patient_id, patient_name, original in processed_data:
            score = self.model.predict_proba(features_df)[0][1]  # Probability of high risk
            scores.append({
                'id': patient_id,
                'name': patient_name,
                'score': score,
                'reason': self.reason_gen.generate_reason(original)
            })
        
        return pd.DataFrame(scores)
    
    def score_batch(self, patients_data):
        """
        Score a batch of patients provided as a list of dictionaries.
        
        Parameters:
        -----------
        patients_data : list
            List of patient dictionaries
            
        Returns:
        --------
        list
            List of patients with scores and risk categories, sorted by score descending
        """
        # Convert list of dicts to DataFrame
        patients_df = pd.DataFrame(patients_data)
        
        # Get scores
        scored_df = self.predict_risk_scores(patients_df)
        
        # Sort by score descending
        ranked_df = scored_df.sort_values('score', ascending=False)
        
        # Add risk category and rank
        results = []
        for i, (_, row) in enumerate(ranked_df.iterrows()):
            score_val = float(row['score'])
            # Normalize to 0-100 if it's 0-1
            if score_val <= 1.0:
                score_val = round(score_val * 100)
            
            risk_category = "LOW"
            if score_val >= 80:
                risk_category = "CRITICAL"
            elif score_val >= 50:
                risk_category = "HIGH"
            elif score_val >= 30:
                risk_category = "MEDIUM"
                
            results.append({
                'rank': i + 1,
                'id': row['id'],
                'name': row['name'],
                'score': int(score_val),
                'risk_category': risk_category,
                'reason': row['reason']
            })
            
        return results
    
    def get_top_risk_patients(self, n_top=5):
        """
        Get top risk patients ranked by score.
        
        Parameters:
        -----------
        n_top : int
            Number of top patients to return
        
        Returns:
        --------
        list
            List of top patients with id, name, score, reason
        """
        patients_df = self.load_patient_data()
        scored_patients = self.predict_risk_scores(patients_df)
        
        # Rank by score descending
        top_patients = scored_patients.sort_values('score', ascending=False).head(n_top)
        
        return top_patients.to_dict('records')
    
    def preprocess_patient(self, patient):
        """
        Preprocess a single patient record for inference.
        
        Parameters:
        -----------
        patient : dict
            Patient record with features
        
        Returns:
        --------
        pd.DataFrame
            Preprocessed features ready for model
        """
        # Create copy to avoid modifying original
        p = patient.copy()
        
        # Store id and name for later
        patient_id = p.pop('id', None)
        patient_name = p.pop('name', None)
        
        # Ensure all required features are present with default values
        p_processed = {
            'age': p.get('age', 45),
            'diagnosis_code': p.get('diagnosis_code', 'E11'),
            'bp_systolic': p.get('bp_systolic', 120),
            'spo2': p.get('spo2', 98),
            'days_since_discharge': p.get('days_since_discharge', 15),
            'missed_visits': p.get('missed_visits', 0),
            'medication_adherence': p.get('medication_adherence', 0.9),
            'last_visit_gap_days': p.get('last_visit_gap_days', 30)
        }
        
        # Encode diagnosis if encoder available
        if 'diagnosis_code' in self.encoders:
            try:
                p_processed['diagnosis_code'] = self.encoders['diagnosis_code'].transform([p_processed['diagnosis_code']])[0]
            except:
                p_processed['diagnosis_code'] = 0
        
        # Create DataFrame with correct feature order
        features = ['age', 'diagnosis_code', 'bp_systolic', 'spo2', 
                   'days_since_discharge', 'missed_visits', 
                   'medication_adherence', 'last_visit_gap_days']
        
        df = pd.DataFrame([p_processed])[features]
        
        return df, patient_id, patient_name
