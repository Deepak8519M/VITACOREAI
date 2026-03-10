# VitaCore AI - Premium AI-Powered Healthcare Prediction Platform

A full-stack multi-disease prediction system with secure health management, built with React, Node.js, and Python ML models.

## 🏗️ Project Structure

```
VITACORE/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # Node.js + Express API
├── ml-api/            # Python ML models & FastAPI
└── docs/              # Setup & deployment guides
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB (or PostgreSQL)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure MongoDB, JWT secret
npm run dev
```

### 2. ML API Setup

```bash
cd ml-api
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python train_models.py  # Train all models (first run)
uvicorn main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- ML API: http://localhost:8000

## 📋 Features

- **Authentication** - JWT-based sign up, login, profile management
- **8 Disease Predictions** - Diabetes, Heart, Stroke, Kidney, Liver, Lung Cancer, Breast Cancer, Hypertension
- **Health Dashboard** - Analytics, charts, prediction history
- **Medical Records** - Secure encrypted storage
- **Symptom Checker** - Pre-consultation guidance
- **Expandable Architecture** - Ready for OCR, doctor finder, chatbot, etc.

## 🔒 Security

- bcrypt password hashing
- JWT authentication
- Encrypted medical data
- API rate limiting
- Input validation

## 📄 License

MIT
