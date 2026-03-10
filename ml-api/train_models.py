"""
VitaCore AI - Model Training Script
Trains all 8 disease prediction models with synthetic/demo data.
For production: replace with real datasets (e.g., UCI ML Repository)
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
import joblib

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

def generate_synthetic(n_samples=500, n_features=8, positive_ratio=0.35):
    """Generate synthetic training data"""
    np.random.seed(42)
    X = np.random.randn(n_samples, n_features) * 2 + np.random.rand(n_samples, n_features) * 5
    y = (np.random.rand(n_samples) < positive_ratio).astype(int)
    return X, y

def train_and_save(name, n_features, n_samples=600, scaler=None):
    X, y = generate_synthetic(n_samples, n_features)
    if scaler:
        X = scaler.fit_transform(X)
    model = GradientBoostingClassifier(n_estimators=100, max_depth=4, random_state=42)
    scores = cross_val_score(model, X, y, cv=3)
    print(f"  {name}: CV accuracy {scores.mean():.2f} (+/- {scores.std()*2:.2f})")
    model.fit(X, y)
    path = os.path.join(MODEL_DIR, f"{name}.joblib")
    joblib.dump(model, path)
    if scaler:
        joblib.dump(scaler, os.path.join(MODEL_DIR, f"{name}_scaler.joblib"))
    return model

def main():
    print("Training VitaCore AI disease prediction models...")
    
    train_and_save("diabetes", 8)
    train_and_save("heart", 13)
    train_and_save("stroke", 10)
    train_and_save("kidney", 24)
    train_and_save("liver", 10)
    train_and_save("lung_cancer", 23)
    train_and_save("breast_cancer", 10)
    train_and_save("hypertension", 12)
    
    print("\nAll models saved to", MODEL_DIR)
    print("Run: uvicorn main:app --reload")

if __name__ == "__main__":
    main()
