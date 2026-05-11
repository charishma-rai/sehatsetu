"""
Train XGBoost model to predict patient risk of missing follow-up visit.
Uses synthetic patient data to build a predictive model.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import joblib
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def prepare_features(df):
    """
    Prepare features for model training.
    
    Parameters:
    -----------
    df : pd.DataFrame
        DataFrame with patient records
    
    Returns:
    --------
    tuple
        (X: feature matrix, y: target vector, encoders: dict of LabelEncoders)
    """
    X = df.copy()
    y = X.pop('target_risk')
    
    # Remove ID and name (not useful for model)
    X = X.drop(['id', 'name'], axis=1)
    
    # Encode diagnosis_code
    le = LabelEncoder()
    X['diagnosis_code'] = le.fit_transform(X['diagnosis_code'])
    
    encoders = {'diagnosis_code': le}
    
    return X, y, encoders


def train_model(X_train, y_train):
    """
    Train XGBoost classifier.
    
    Parameters:
    -----------
    X_train : pd.DataFrame
        Training features
    y_train : pd.Series
        Training target
    
    Returns:
    --------
    xgb.XGBClassifier
        Trained model
    """
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        objective='binary:logistic',
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    
    model.fit(
        X_train,
        y_train,
        verbose=False
    )
    
    return model


def main():
    """Load data, train model, and save to disk."""
    print("Starting model training pipeline...")
    
    # Load data
    data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'patients.csv')
    
    if not os.path.exists(data_path):
        print(f"Error: Data file not found at {data_path}")
        print("Please run generate_data.py first.")
        sys.exit(1)
    
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} records")
    
    # Prepare features
    print("Preparing features...")
    X, y, encoders = prepare_features(df)
    
    print(f"Feature matrix shape: {X.shape}")
    print(f"Target distribution:\n{y.value_counts()}")
    print(f"Features: {list(X.columns)}")
    
    # Split data
    print("\nSplitting data into train/test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )
    
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Train model
    print("\nTraining XGBoost model...")
    model = train_model(X_train, y_train)
    
    # Evaluate
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    print(f"Training accuracy: {train_score:.4f}")
    print(f"Test accuracy: {test_score:.4f}")
    
    # Save model
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    joblib.dump(model, model_path)
    print(f"\nModel saved to {model_path}")
    
    # Save encoders
    encoders_path = os.path.join(os.path.dirname(__file__), 'encoders.pkl')
    joblib.dump(encoders, encoders_path)
    print(f"Encoders saved to {encoders_path}")
    
    # Feature importance
    feature_importance = model.feature_importances_
    features = X.columns.tolist()
    importance_df = pd.DataFrame({
        'feature': features,
        'importance': feature_importance
    }).sort_values('importance', ascending=False)
    
    print("\nFeature Importance:")
    print(importance_df.to_string(index=False))
    
    print("\nTraining complete!")


if __name__ == '__main__':
    main()
