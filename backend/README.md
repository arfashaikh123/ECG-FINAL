# CardioScan — ECG Arrhythmia Detection Backend

Flask API backend for the CardioScan ECG arrhythmia detection web application.

## Setup

### 1. Create a virtual environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Mac/Linux
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
Copy or edit `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
MODEL_PATH=../best_model.h5
FLASK_DEBUG=true
PORT=5000
```

### 4. Run the server
```bash
python app.py
```

The server will start at `http://localhost:5000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/predict` | Predict arrhythmia from CSV upload or JSON signal |
| POST | `/api/predict/batch` | Batch predict from CSV |
| GET | `/api/sample` | Get sample ECG data |
| POST | `/api/chat` | Chat with CardioAI (LLM) |
| GET | `/api/classes` | Get arrhythmia class info |

## Deployment on Render

1. Push this `backend` folder to a Git repository
2. Create a new **Web Service** on Render
3. Set the following:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120`
   - **Environment Variables**: Set `GEMINI_API_KEY` and `MODEL_PATH`
4. Upload `best_model.h5` or configure model storage

## Model

The model (`best_model.h5`) is a 2D CNN trained on the MIT-BIH Arrhythmia Database.

**Classes:**
- 0: Normal
- 1: Supraventricular Ectopic Beats  
- 2: Ventricular Ectopic Beats
- 3: Fusion Beats
- 4: Unknown Beats

**Accuracy:** ~86.12%
