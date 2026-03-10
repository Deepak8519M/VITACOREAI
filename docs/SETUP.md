# VitaCore AI - Setup Guide

## Prerequisites

- **Node.js** 18 or higher
- **Python** 3.9 or higher
- **MongoDB** (local or Atlas)
- **npm** or yarn

## Step 1: Clone and Install

```bash
cd VITACORE
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## Step 2: MongoDB

### Option A: Local MongoDB

1. Install MongoDB Community from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Default URI: `mongodb://localhost:27017/vitacore`

### Option B: MongoDB Atlas (Cloud)

1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Get connection string
3. Replace in `.env`: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vitacore`

## Step 3: Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vitacore
JWT_SECRET=change-this-to-a-long-random-string-in-production
JWT_EXPIRES_IN=7d
ML_API_URL=http://localhost:8000
NODE_ENV=development
GOOGLE_AI_API_KEY=your_gemini_api_key_here
GOOGLE_AI_MODEL=gemini-2.5-flash
```

## Step 4: ML API Setup

```bash
cd ml-api
python -m venv venv
```

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

```bash
pip install -r requirements.txt
python train_models.py
```

This trains all 8 disease models and saves them to `ml-api/models/`.

## Step 5: Run the Application

Open **3 terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - ML API:**
```bash
cd ml-api
venv\Scripts\activate   # or source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
cp .env.example .env   # optional: for Report Comparison tool
npm run dev
```

### Report Comparison Tool (optional)

For the AI Report Comparison tool, add a Gemini API key:
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create `frontend/.env` with: `VITE_GEMINI_API_KEY=your_key_here`

### Health Chatbot Tool (recommended secure setup)

The chatbot uses the backend so your API key is not exposed in the browser:
1. Put the key in `backend/.env` as `GOOGLE_AI_API_KEY`
2. Restart the backend server

## Step 6: Access

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **ML API:** http://localhost:8000

Create an account at Sign Up, then use the dashboard and prediction tools.

## Troubleshooting

### "ML API error" when running predictions

- Ensure the ML API is running on port 8000
- Run `python train_models.py` first to generate model files

### MongoDB connection failed

- Check MongoDB is running
- Verify `MONGODB_URI` in backend `.env`

### CORS errors

- Ensure backend `FRONTEND_URL` matches your frontend origin (default http://localhost:5173)
