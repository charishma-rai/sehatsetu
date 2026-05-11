"""
Generate synthetic patient dataset for RiskSense model training.
Creates a CSV file with patient risk factors and missed visit target variable.
"""

import pandas as pd
import numpy as np
import os

def generate_synthetic_data(n_samples=500, seed=42):
    """
    Generate synthetic patient dataset for model training.
    
    Parameters:
    -----------
    n_samples : int
        Number of synthetic patient records to generate
    seed : int
        Random seed for reproducibility
    
    Returns:
    --------
    pd.DataFrame
        DataFrame with patient records and risk labels
    """
    np.random.seed(seed)
    
    data = {
        'id': range(1, n_samples + 1),
        'name': [f'Patient_{i}' for i in range(1, n_samples + 1)],
        'age': np.random.randint(18, 85, n_samples),
        'diagnosis_code': np.random.choice(
            ['E11', 'I10', 'J44', 'I50', 'E78', 'F41'],  # ICD-10 codes for common conditions
            n_samples
        ),
        'bp_systolic': np.random.normal(130, 15, n_samples).astype(int),
        'spo2': np.random.normal(97, 2, n_samples).astype(int),
        'days_since_discharge': np.random.randint(1, 60, n_samples),
        'missed_visits': np.random.randint(0, 4, n_samples),
        'medication_adherence': np.random.uniform(0.3, 1.0, n_samples).round(2),
        'last_visit_gap_days': np.random.randint(1, 90, n_samples),
    }
    
    # Create target variable based on risk factors
    # Higher risk of missing next visit based on:
    # - Days since discharge (longer = higher risk)
    # - Missed visits (more missed = higher risk)
    # - Low medication adherence (lower = higher risk)
    # - High visit gap (longer = higher risk)
    df = pd.DataFrame(data)
    
    risk_score = (
        (df['days_since_discharge'] / 60) * 0.25 +
        (df['missed_visits'] / 3) * 0.25 +
        (1 - df['medication_adherence']) * 0.25 +
        (df['last_visit_gap_days'] / 90) * 0.25
    )
    
    # Binary classification: High risk if risk_score > median
    df['target_risk'] = (risk_score > risk_score.median()).astype(int)
    
    # Clip SpO2 and BP to realistic ranges
    df['spo2'] = df['spo2'].clip(80, 100)
    df['bp_systolic'] = df['bp_systolic'].clip(90, 200)
    
    return df


def main():
    """Generate and save synthetic patient data."""
    print("Generating synthetic patient dataset...")
    
    # Generate data
    df = generate_synthetic_data(n_samples=500)
    
    # Create output path
    output_path = os.path.join(os.path.dirname(__file__), 'patients.csv')
    
    # Save to CSV
    df.to_csv(output_path, index=False)
    
    print(f"Dataset generated successfully!")
    print(f"Saved to: {output_path}")
    print(f"Total records: {len(df)}")
    print(f"Risk distribution:")
    print(df['target_risk'].value_counts())
    print(f"\nDataset preview:")
    print(df.head(10))


if __name__ == '__main__':
    main()
