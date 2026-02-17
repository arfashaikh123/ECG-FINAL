# CardioScan — ECG Arrhythmia Detection System

<div align="center">

![ECG Arrhythmia Detection](ecg_image.png)

**An intelligent web application for detecting cardiac arrhythmias using deep learning**

</div>

## 🎯 Overview

CardioScan is a full-stack web application that uses a 2D Convolutional Neural Network (CNN) to classify ECG signals and detect cardiac arrhythmias. The system can identify 5 types of heartbeat patterns from ECG data with ~86% accuracy, trained on the MIT-BIH Arrhythmia Database.

## 🏗️ Architecture

```
ECG-FINAL/
├── backend/              # Flask API server
├── ecg-arrhythmia/       # React frontend
├── best_model.h5         # Trained 2D CNN model
├── datasets.csv          # Training dataset
├── mitbih_test.csv       # Test dataset
└── *.ipynb              # Jupyter notebooks for model training
```

## ✨ Features

- **Real-time ECG Analysis**: Upload ECG signals in CSV format or JSON
- **Batch Processing**: Analyze multiple ECG samples at once
- **AI-Powered Chat**: Interact with CardioAI (LLM) for medical insights
- **Sample Data**: Pre-loaded sample ECG data for testing
- **Visual Feedback**: Interactive ECG waveform visualization
- **5 Classification Types**:
  - Normal Beats
  - Supraventricular Ectopic Beats
  - Ventricular Ectopic Beats
  - Fusion Beats
  - Unknown Beats

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Option 1: Automated Setup (Windows)

Run the provided batch script to start both backend and frontend:

```bash
run_cardioscan.bat
```

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate    # Windows
   # source venv/bin/activate  # Mac/Linux
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   
   Create a `.env` file in the `backend` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   MODEL_PATH=../best_model.h5
   FLASK_DEBUG=true
   PORT=5000
   ```

5. **Run the backend**
   ```bash
   python app.py
   ```

   Backend will be available at `http://localhost:5000`

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ecg-arrhythmia
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Frontend will be available at `http://localhost:5173`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |
| POST | `/api/predict` | Predict arrhythmia from CSV or JSON signal |
| POST | `/api/predict/batch` | Batch prediction from CSV file |
| GET | `/api/sample` | Retrieve sample ECG data |
| POST | `/api/chat` | Chat with CardioAI assistant |
| GET | `/api/classes` | Get arrhythmia classification information |

## 🧠 Model Architecture

The system uses a **2D Convolutional Neural Network (CNN)** trained on the MIT-BIH Arrhythmia Database:

- **Model Type**: Deep Learning CNN
- **Architecture**: 2D Convolutional Layers
- **Input**: ECG signal data (187 samples per heartbeat)
- **Output**: 5 classes of heartbeat types
- **Accuracy**: ~86.12%
- **Model File**: `best_model.h5`

![CNN Architecture](convnet_fig.png)

## 📊 Dataset

- **Source**: MIT-BIH Arrhythmia Database
- **Training Data**: `datasets.csv` (~45MB)
- **Test Data**: `mitbih_test.csv` (~103MB)
- **Sample Data**: `sample.csv`, `ecg.csv`

## 🔬 Model Training

The model training notebooks are included:

- `ECG Arrhythmia classification using 2D convolutional model.ipynb` - Main training notebook
- `Implementation.ipynb` - Implementation and testing notebook

To retrain the model:

```bash
jupyter notebook "ECG Arrhythmia classification using 2D convolutional model.ipynb"
```

## 📚 Documentation

Additional documentation is available in the repository:

- `ECG Arrhythmia Detection Using 2D CNN Model.pdf` - Technical documentation
- `ECG Arrhythmia Report.pdf` - Comprehensive project report
- `README_WEB_APP.md` - Web application specific documentation

## 🌐 Deployment

### Deploy Backend on Render

1. Push the `backend` folder to a Git repository
2. Create a new **Web Service** on [Render](https://render.com)
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120`
   - **Environment Variables**: 
     - `GEMINI_API_KEY`
     - `MODEL_PATH`
4. Upload `best_model.h5` or configure model storage

### Deploy Frontend

Deploy the `ecg-arrhythmia` folder to services like Vercel, Netlify, or GitHub Pages.

## 🛠️ Tech Stack

**Backend:**
- Flask (Python web framework)
- TensorFlow/Keras (Deep learning)
- NumPy, Pandas (Data processing)
- Gunicorn (Production server)
- Google Gemini API (AI chat)

**Frontend:**
- React 18
- Vite (Build tool)
- React Compiler
- Chart.js/D3.js (Visualization)

**Machine Learning:**
- TensorFlow 2.x
- Keras
- 2D CNN Architecture

## 📝 Usage Example

### Uploading ECG Data

1. Navigate to the web application
2. Click "Upload CSV" or "Enter JSON data"
3. Select your ECG signal file (187 samples per beat)
4. Click "Analyze"
5. View the prediction results and confidence scores

### Using CardioAI Chat

1. Navigate to the Chat section
2. Ask questions about ECG interpretation, arrhythmias, or results
3. Receive AI-powered medical insights

## ⚠️ Disclaimer

**This application is for educational and research purposes only.** It should NOT be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.

## 📄 License

This project is provided as-is for educational purposes.

## 👥 Contributors

- Arfa Shaikh ([@arfashaikh123](https://github.com/arfashaikh123))

## 📧 Contact

For questions or support, please open an issue in this repository.

---

<div align="center">

**Made with ❤️ for better cardiac health monitoring**

</div>
