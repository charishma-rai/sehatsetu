"""
Generate explainable plain-English reasons for patient risk scores.
Provides clinician and ASHA worker-friendly explanations for prioritization decisions.
"""

import pandas as pd


class ReasonGenerator:
    """Generate human-readable risk explanations."""
    
    def __init__(self):
        """Initialize reason templates."""
        self.diagnosis_names = {
            'E11': 'diabetes',
            'I10': 'hypertension',
            'J44': 'chronic respiratory disease',
            'I50': 'heart failure',
            'E78': 'lipid disorder',
            'F41': 'anxiety disorder'
        }
    
    def get_diagnosis_name(self, code):
        """Get human-readable diagnosis name."""
        return self.diagnosis_names.get(code, 'chronic condition')
    
    def generate_reason(self, patient_record):
        """
        Generate an explainable reason string for risk score.
        
        Parameters:
        -----------
        patient_record : dict
            Patient record with features
        
        Returns:
        --------
        str
            Human-readable explanation of risk factors
        """
        reasons = []
        
        # Missed visits
        missed_visits = patient_record.get('missed_visits', 0)
        if missed_visits > 0:
            if missed_visits == 1:
                reasons.append("Missed last visit")
            else:
                reasons.append(f"Missed {missed_visits} visits")
        
        # Age
        age = patient_record.get('age', 0)
        if age > 65:
            reasons.append(f"Age {age}")
        elif age < 30:
            reasons.append(f"Age {age}")
        
        # Diagnosis
        diagnosis_code = patient_record.get('diagnosis_code', '')
        if diagnosis_code:
            reasons.append(self.get_diagnosis_name(diagnosis_code))
        
        # Blood pressure
        bp_systolic = patient_record.get('bp_systolic', 0)
        if bp_systolic > 160:
            reasons.append("BP critically high")
        elif bp_systolic > 140:
            reasons.append("BP high")
        
        # SpO2
        spo2 = patient_record.get('spo2', 100)
        if spo2 < 90:
            reasons.append("SpO2 low")
        elif spo2 < 94:
            reasons.append("SpO2 below optimal")
        
        # Medication adherence
        medication_adherence = patient_record.get('medication_adherence', 1.0)
        if medication_adherence < 0.5:
            reasons.append("Medication missed")
        elif medication_adherence < 0.75:
            reasons.append("Inconsistent medication")
        
        # Days since discharge
        days_since_discharge = patient_record.get('days_since_discharge', 0)
        if days_since_discharge > 30:
            reasons.append(f"{days_since_discharge} days since discharge")
        elif days_since_discharge > 14:
            reasons.append(f"Recent discharge ({days_since_discharge} days)")
        
        # Select top 2-3 reasons
        if len(reasons) > 3:
            selected_reasons = reasons[:3]
        else:
            selected_reasons = reasons
        
        # Join with " + "
        reason_str = " + ".join(selected_reasons)
        
        return reason_str
    
    def generate_summary_reason(self, patient_record):
        """
        Generate a concise one-liner reason.
        
        Parameters:
        -----------
        patient_record : dict
            Patient record with features
        
        Returns:
        --------
        str
            Concise explanation
        """
        factors = []
        
        # Priority 1: Missed visits
        if patient_record.get('missed_visits', 0) > 0:
            factors.append("missed visits")
        
        # Priority 2: Age + comorbidity
        age = patient_record.get('age', 0)
        if age > 65:
            factors.append(f"age {age}")
        
        # Priority 3: Recent vital abnormality
        bp = patient_record.get('bp_systolic', 0)
        spo2 = patient_record.get('spo2', 100)
        
        if bp > 160 or spo2 < 90:
            factors.append("abnormal vitals")
        
        # Priority 4: Adherence issue
        if patient_record.get('medication_adherence', 1.0) < 0.6:
            factors.append("medication concern")
        
        diagnosis = self.get_diagnosis_name(patient_record.get('diagnosis_code', ''))
        
        if factors:
            return f"{diagnosis}: {', '.join(factors[:2])}"
        else:
            return f"Post-discharge {diagnosis} follow-up needed"


def generate_batch_reasons(patients_df):
    """
    Generate reasons for multiple patients.
    
    Parameters:
    -----------
    patients_df : pd.DataFrame
        DataFrame with patient records
    
    Returns:
    --------
    pd.Series
        Series of reason strings indexed by patient ID
    """
    generator = ReasonGenerator()
    reasons = []
    
    for _, patient in patients_df.iterrows():
        patient_dict = patient.to_dict()
        reason = generator.generate_reason(patient_dict)
        reasons.append(reason)
    
    return pd.Series(reasons, index=patients_df.index)


if __name__ == '__main__':
    # Example usage
    gen = ReasonGenerator()
    
    sample_patient = {
        'age': 67,
        'diagnosis_code': 'E11',
        'bp_systolic': 165,
        'spo2': 94,
        'days_since_discharge': 25,
        'missed_visits': 1,
        'medication_adherence': 0.7,
        'last_visit_gap_days': 45
    }
    
    print("Detailed reason:")
    print(gen.generate_reason(sample_patient))
    print("\nSummary reason:")
    print(gen.generate_summary_reason(sample_patient))
