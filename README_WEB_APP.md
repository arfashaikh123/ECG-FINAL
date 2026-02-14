# CardioScan: AI-Powered ECG Arrhythmia Detection

This project is a modern web application for detecting cardiac arrhythmias using Deep Learning (2D CNN) and providing AI-powered insights via Google Gemini.

## Project Structure

- **`ecg-arrhythmia/`**: React Frontend (Vite + React 19)
  - Interactive ECG visualization
  - Dark-themed medical UI
  - Real-time analysis dashboard
  - Chat interface with CardioAI

- **`backend/`**: Python Backend (Flask)
  - 2D CNN Model (`best_model.h5`)
  - REST API for prediction and data processing
  - Integration with Google Gemini LLM
  - Sample data service

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)

### 1. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
The API will run at `http://localhost:5000`.

### 2. Frontend Setup
Navigate to the `ecg-arrhythmia` directory:
```bash
cd ecg-arrhythmia
npm install
npm run dev
```
The app will run at `http://localhost:3000`.

## Deployment (Render)

### Backend (Web Service)
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
- Env Vars:
   - `GROQ_API_KEY` (Get from Groq Cloud Console)
   - `MODEL_PATH=best_model.h5`

### Frontend (Static Site)
- Build Command: `npm run build`
- Publish Directory: `dist`
- Rewrite Rule: `/*` -> `/index.html` (for client-side routing)
