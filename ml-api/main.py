"""
VitaCore AI - ML Prediction API
FastAPI service exposing disease prediction endpoints
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import joblib
import os
import numpy as np

app = FastAPI(title="VitaCore ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# Disease-specific input schemas
class DiabetesInput(BaseModel):
    pregnancies: float = 0
    glucose: float = 100
    blood_pressure: float = 70
    skin_thickness: float = 20
    insulin: float = 80
    bmi: float = 25
    diabetes_pedigree: float = 0.5
    age: float = 35

class HeartInput(BaseModel):
    age: float = 55
    sex: float = 1  # 1 male, 0 female
    cp: float = 0  # chest pain type
    trestbps: float = 120
    chol: float = 200
    fbs: float = 0
    restecg: float = 0
    thalach: float = 150
    exang: float = 0
    oldpeak: float = 1.0
    slope: float = 1
    ca: float = 0
    thal: float = 2

class StrokeInput(BaseModel):
    gender: float = 1
    age: float = 55
    hypertension: float = 0
    heart_disease: float = 0
    ever_married: float = 1
    work_type: float = 2
    residence_type: float = 1
    avg_glucose_level: float = 100
    bmi: float = 25
    smoking_status: float = 1

class KidneyInput(BaseModel):
    age: float = 55
    bp: float = 80
    sg: float = 1.02
    al: float = 0
    su: float = 0
    rbc: float = 1
    pc: float = 0
    pcc: float = 0
    ba: float = 0
    bgr: float = 120
    bu: float = 40
    sc: float = 1.2
    sod: float = 140
    pot: float = 4.5
    hemo: float = 14
    pcv: float = 44
    wc: float = 8000
    rc: float = 5
    htn: float = 0
    dm: float = 0
    cad: float = 0
    appet: float = 1
    pe: float = 0
    ane: float = 0

class LiverInput(BaseModel):
    age: float = 55
    gender: float = 1
    total_bilirubin: float = 1.0
    direct_bilirubin: float = 0.3
    alkaline_phosphatase: float = 200
    alamine_aminotransferase: float = 40
    aspartate_aminotransferase: float = 35
    total_proteins: float = 7.0
    albumin: float = 4.0
    albumin_globulin_ratio: float = 1.2

class LungCancerInput(BaseModel):
    age: float = 60
    gender: float = 1
    air_pollution: float = 2
    alcohol_use: float = 1
    dust_allergy: float = 1
    occupational_hazards: float = 1
    genetic_risk: float = 1
    chronic_lung_disease: float = 0
    balanced_diet: float = 1
    obesity: float = 0
    smoking: float = 1
    passive_smoking: float = 1
    chest_pain: float = 0
    coughing_blood: float = 0
    fatigue: float = 0
    weight_loss: float = 0
    shortness_of_breath: float = 0
    wheezing: float = 0
    swallowing_difficulty: float = 0
    clubbing: float = 0
    frequent_cold: float = 0
    dry_cough: float = 0
    snoring: float = 0

class BreastCancerInput(BaseModel):
    radius_mean: float = 14
    texture_mean: float = 19
    perimeter_mean: float = 90
    area_mean: float = 650
    smoothness_mean: float = 0.1
    compactness_mean: float = 0.1
    concavity_mean: float = 0.05
    concave_points_mean: float = 0.03
    symmetry_mean: float = 0.2
    fractal_dimension_mean: float = 0.06

class HypertensionInput(BaseModel):
    age: float = 50
    sex: float = 1
    bmi: float = 28
    heart_rate: float = 75
    glucose: float = 100
    cholesterol: float = 200
    smoking: float = 0
    alcohol: float = 0
    physical_activity: float = 1
    salt_intake: float = 1  # 0 low, 1 med, 2 high
    stress_level: float = 1  # 0-3
    family_history: float = 1

class SymptomCheckInput(BaseModel):
    symptoms: List[str]

def load_model(name: str):
    path = os.path.join(MODEL_DIR, f"{name}.joblib")
    if not os.path.exists(path):
        raise HTTPException(500, f"Model {name} not found. Run train_models.py first.")
    return joblib.load(path)

def risk_level(prob: float) -> str:
    if prob < 0.3: return "Low"
    if prob < 0.6: return "Medium"
    return "High"

def get_suggestions(disease: str, risk: str, pct: float) -> dict:
    base = {
        "explanation": f"Based on your inputs, the model estimates a {risk.lower()} risk ({pct:.1f}%) for {disease.replace('_', ' ')}.",
        "suggestions": [
            "Maintain a balanced diet rich in fruits and vegetables",
            "Engage in regular physical activity (150 min/week)",
            "Avoid smoking and limit alcohol consumption",
            "Get adequate sleep (7-8 hours)",
            "Manage stress through relaxation techniques"
        ],
        "consult_doctor": "Consult a healthcare provider soon." if risk != "Low" else "Schedule a routine check-up within 6 months."
    }
    if disease == "diabetes":
        base["suggestions"].insert(0, "Monitor blood glucose levels regularly")
    elif disease == "heart":
        base["suggestions"].insert(0, "Monitor blood pressure and cholesterol")
    elif disease == "stroke":
        base["suggestions"].insert(0, "Control blood pressure and manage atrial fibrillation if present")
    elif disease == "kidney":
        base["suggestions"].insert(0, "Stay hydrated and reduce sodium intake")
    elif disease == "liver":
        base["suggestions"].insert(0, "Limit alcohol and avoid hepatotoxic substances")
    elif disease in ["lung_cancer", "breast_cancer"]:
        base["suggestions"].insert(0, "Consider screening as per guidelines")
    elif disease == "hypertension":
        base["suggestions"].insert(0, "Reduce sodium intake and monitor blood pressure daily")
    return base

@app.get("/")
def root():
    return {"message": "VitaCore ML API", "status": "running"}

@app.post("/predict/diabetes")
def predict_diabetes(d: DiabetesInput):
    model = load_model("diabetes")
    x = np.array([[d.pregnancies, d.glucose, d.blood_pressure, d.skin_thickness, d.insulin, d.bmi, d.diabetes_pedigree, d.age]])
    prob = float(model.predict_proba(x)[0][1])
    risk = risk_level(prob)
    info = get_suggestions("diabetes", risk, prob * 100)
    return {"risk": risk, "percentage": round(prob * 100, 1), **info}

@app.post("/predict/heart")
def predict_heart(d: HeartInput):
    model = load_model("heart")
    x = np.array([[d.age, d.sex, d.cp, d.trestbps, d.chol, d.fbs, d.restecg, d.thalach, d.exang, d.oldpeak, d.slope, d.ca, d.thal]])
    prob = float(model.predict_proba(x)[0][1])
    risk = risk_level(prob)
    info = get_suggestions("heart disease", risk, prob * 100)
    return {"risk": risk, "percentage": round(prob * 100, 1), **info}

@app.post("/predict/stroke")
def predict_stroke(d: StrokeInput):
    model = load_model("stroke")
    x = np.array([[d.gender, d.age, d.hypertension, d.heart_disease, d.ever_married, d.work_type, d.residence_type, d.avg_glucose_level, d.bmi, d.smoking_status]])
    prob = float(model.predict_proba(x)[0][1])
    risk = risk_level(prob)
    info = get_suggestions("stroke", risk, prob * 100)
    return {"risk": risk, "percentage": round(prob * 100, 1), **info}

@app.post("/predict/kidney")
def predict_kidney(d: KidneyInput):
    model = load_model("kidney")
    cols = ["age","bp","sg","al","su","rbc","pc","pcc","ba","bgr","bu","sc","sod","pot","hemo","pcv","wc","rc","htn","dm","cad","appet","pe","ane"]
    vals = [d.age,d.bp,d.sg,d.al,d.su,d.rbc,d.pc,d.pcc,d.ba,d.bgr,d.bu,d.sc,d.sod,d.pot,d.hemo,d.pcv,d.wc,d.rc,d.htn,d.dm,d.cad,d.appet,d.pe,d.ane]
    x = np.array([vals])
    prob = float(model.predict_proba(x)[0][1])
    risk = risk_level(prob)
    info = get_suggestions("kidney disease", risk, prob * 100)
    return {"risk": risk, "percentage": round(prob * 100, 1), **info}

@app.post("/predict/liver")
def predict_liver(d: LiverInput):
    model = load_model("liver")
    x = np.array([[d.age, d.gender, d.total_bilirubin, d.direct_bilirubin, d.alkaline_phosphatase, d.alamine_aminotransferase, d.aspartate_aminotransferase, d.total_proteins, d.albumin, d.albumin_globulin_ratio]])
    prob = float(model.predict_proba(x)[0][1])
    risk = risk_level(prob)
    info = get_suggestions("liver disease", risk, prob * 100)
    return {"risk": risk, "percentage": round(prob * 100, 1), **info}

@app.post("/predict/lung_cancer")
def predict_lung_cancer(d: LungCancerInput):
    model = load_model("lung_cancer")
    x = np.array([[d.age,d.gender,d.air_pollution,d.alcohol_use,d.dust_allergy,d.occupational_hazards,d.genetic_risk,d.chronic_lung_disease,d.balanced_diet,d.obesity,d.smoking,d.passive_smoking,d.chest_pain,d.coughing_blood,d.fatigue,d.weight_loss,d.shortness_of_breath,d.wheezing,d.swallowing_difficulty,d.clubbing,d.frequent_cold,d.dry_cough,d.snoring]])
    prob = float(model.predict_proba(x)[0][1])
    risk = risk_level(prob)
    info = get_suggestions("lung cancer", risk, prob * 100)
    return {"risk": risk, "percentage": round(prob * 100, 1), **info}

@app.post("/predict/breast_cancer")
def predict_breast_cancer(d: BreastCancerInput):
    model = load_model("breast_cancer")
    x = np.array([[d.radius_mean,d.texture_mean,d.perimeter_mean,d.area_mean,d.smoothness_mean,d.compactness_mean,d.concavity_mean,d.concave_points_mean,d.symmetry_mean,d.fractal_dimension_mean]])
    prob = float(model.predict_proba(x)[0][1])
    risk = risk_level(prob)
    info = get_suggestions("breast cancer", risk, prob * 100)
    return {"risk": risk, "percentage": round(prob * 100, 1), **info}

@app.post("/predict/hypertension")
def predict_hypertension(d: HypertensionInput):
    model = load_model("hypertension")
    x = np.array([[d.age,d.sex,d.bmi,d.heart_rate,d.glucose,d.cholesterol,d.smoking,d.alcohol,d.physical_activity,d.salt_intake,d.stress_level,d.family_history]])
    prob = float(model.predict_proba(x)[0][1])
    risk = risk_level(prob)
    info = get_suggestions("hypertension", risk, prob * 100)
    return {"risk": risk, "percentage": round(prob * 100, 1), **info}

# Symptom checker - rule-based mapping
SYMPTOM_DB = {
    "headache": ["migraine", "hypertension", "tension", "dehydration"],
    "chest pain": ["heart disease", "anxiety", "acid reflux"],
    "fatigue": ["anemia", "thyroid", "sleep disorder", "depression"],
    "shortness of breath": ["asthma", "heart disease", "anxiety", "lung condition"],
    "nausea": ["gastrointestinal", "infection", "motion sickness"],
    "fever": ["infection", "inflammatory condition"],
    "cough": ["respiratory infection", "asthma", "allergy"],
    "dizziness": ["hypertension", "dehydration", "inner ear", "anemia"],
    "swelling": ["kidney", "heart", "liver", "allergy"],
    "abdominal pain": ["gastrointestinal", "liver", "kidney"],
}

@app.post("/symptoms/check")
def check_symptoms(d: SymptomCheckInput):
    matched = {}
    for s in d.symptoms:
        s_lower = s.lower().strip()
        for key, conditions in SYMPTOM_DB.items():
            if key in s_lower or s_lower in key:
                matched[s] = conditions
                break
        if s not in matched:
            matched[s] = ["General - consult a doctor for evaluation"]
    
    guidance = "Based on your symptoms, consider these possibilities. This is not a diagnosis. Please consult a healthcare professional for accurate assessment."
    return {"possible_conditions": matched, "guidance": guidance}
