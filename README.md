# 🚀 SehatSetu – Running the Project

SehatSetu is an AI-powered healthcare dashboard for ASHA workers. It consists of a **Flask Backend** (AI Inference) and a **React Frontend**.

## 1. Setup & Start Backend (AI API)
Open a terminal and follow these steps:

### A. Install Python Dependencies
```powershell
# In the root sehatsetu directory
cd backend/visioncare
pip install -r requirements.txt

cd ../risksense
pip install flask flask-cors pandas scikit-learn xgboost
```

### B. Initialize AI Models
Run these once to prepare the models and synthetic data:
```powershell
# Setup RiskSense
cd ../risksense
python data/generate_data.py
python model/train.py

# Setup VisionCare
cd ../visioncare
python train.py
```

### C. Start Unified API
```powershell
cd ../api
python app.py
```
> **Backend URL:** `http://localhost:5000`

---

## 2. Setup & Start Frontend (React)
Open a **new** terminal:

### A. Install Node Dependencies
```powershell
cd sehatsetu/frontend
npm install
```

### B. Start App
```powershell
npm start
```
> **Frontend URL:** `http://localhost:3000`

---

## 🔬 What to Look For
1. **Dynamic Risk Scoring**: The dashboard list is fetched from the RiskSense XGBoost model.
2. **AI Anemia Screening**: Clicking "Scan for Anemia" on a patient profile triggers a real call to the VisionCare EfficientNet B3 model.
3. **Graceful Fallback**: If you stop the backend, the frontend will automatically use its internal hardcoded data to remain functional.
