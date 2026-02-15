import os
import io
import json
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes, allowing all origins, methods, and headers
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

import gc
import tensorflow as tf

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
CLASS_MAPPING = {
    0: "Normal",
    1: "Supraventricular Ectopic Beats",
    2: "Ventricular Ectopic Beats",
    3: "Fusion Beats",
    4: "Unknown Beats",
}

CLASS_DESCRIPTIONS = {
    0: (
        "Normal beats, also known as sinus rhythm, are the standard and regular "
        "heartbeats. They originate from the heart's natural pacemaker, the "
        "sinoatrial (SA) node, and follow a consistent pattern. These beats "
        "maintain the optimal rhythm of the heart, ensuring efficient blood "
        "circulation."
    ),
    1: (
        "Supraventricular ectopic beats are abnormal heartbeats that arise above "
        "the ventricles but outside the normal pathway of the SA node. These beats "
        "can be premature, irregular, or extra beats, often resulting from "
        "electrical disturbances in the atria. They may disrupt the heart's "
        "regular rhythm."
    ),
    2: (
        "Ventricular ectopic beats are abnormal heartbeats originating from the "
        "ventricles, the lower chambers of the heart. These beats are usually "
        "premature and can be caused by various factors, such as heart disease or "
        "stress. Ventricular ectopic beats may feel like a skipped or extra beat "
        "and can potentially lead to more severe arrhythmias."
    ),
    3: (
        "Fusion beats are a unique type of heart rhythm irregularity that occurs "
        "when a normal beat and a premature beat from another source coincide or "
        "'fuse' together on the electrocardiogram (ECG). These beats are "
        "challenging to differentiate from other types of beats and often appear "
        "as a combination of normal and abnormal characteristics."
    ),
    4: (
        "Unknown beats refer to heart rhythms that are difficult to classify or "
        "identify. These beats may not fit into the typical categories of normal, "
        "supraventricular, or ventricular beats. Accurate diagnosis and treatment "
        "of unknown beats can be challenging and may require further investigation "
        "or specialized testing to determine their origin and significance."
    ),
}

CLASS_SEVERITY = {
    0: "normal",
    1: "warning",
    2: "danger",
    3: "caution",
    4: "unknown",
}

TARGET_LENGTH = 186
MODEL_ACCURACY = 99.20

# ---------------------------------------------------------------------------
# Load Keras model (lazy – loaded once on first request)
# ---------------------------------------------------------------------------
_model = None


def get_model():
    global _model
    if _model is None:
        from tensorflow.keras.models import load_model  # noqa: E402

        model_path = os.environ.get(
            "MODEL_PATH",
            os.path.join(os.path.dirname(__file__), "best_model.h5"),
        )
        _model = load_model(model_path, compile=False)
        print(f"[INFO] Model loaded from {model_path}")
    return _model

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response


from typing import Optional

# ---------------------------------------------------------------------------
# LLM helper (Groq)
# ---------------------------------------------------------------------------
def get_llm_response(user_message: str, context: Optional[dict] = None) -> str:
    """Call Groq API (Llama 3) to get an LLM response about ECG / arrhythmia."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return (
            "LLM integration is not configured. Please set the GROQ_API_KEY "
            "environment variable to enable AI-powered insights."
        )

    try:
        from groq import Groq

        client = Groq(api_key=api_key)
        
        system_prompt = (
            "You are HeartAI, a helpful medical AI assistant specializing in "
            "ECG analysis and cardiac arrhythmias. You provide clear, accurate, "
            "and educational information about heart conditions, ECG "
            "interpretations, and arrhythmia types. Always remind users to "
            "consult healthcare professionals for medical decisions. "
            "Keep responses concise but informative. Use markdown formatting."
        )

        context_str = ""
        if context:
            context_str = (
                f"\n\nCurrent ECG Analysis Context:\n"
                f"- Detected beat type: {context.get('beat_type', 'N/A')}\n"
                f"- Confidence: {context.get('confidence', 'N/A')}\n"
                f"- Severity: {context.get('severity', 'N/A')}\n"
            )

        full_prompt = f"{context_str}\n\nUser question: {user_message}"

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": full_prompt}
            ],
            temperature=0.5,
            max_tokens=512,
            top_p=1,
            stream=False,
            stop=None,
        )

        return completion.choices[0].message.content
    except Exception as e:
        return f"Error communicating with LLM: {str(e)}"


# ---------------------------------------------------------------------------
# Signal processing helpers
# ---------------------------------------------------------------------------
def add_gaussian_noise(signal: np.ndarray, target_length: int = TARGET_LENGTH):
    """Pad or truncate a signal to the target length."""
    current_length = len(signal)
    noise_length = target_length - current_length
    if noise_length > 0:
        noise = np.random.normal(0, 0.5, noise_length)
        return np.concatenate((signal, noise), axis=0)
    elif noise_length < 0:
        return signal[:target_length]
    return signal


def preprocess_signal(raw_values: np.ndarray) -> np.ndarray:
    """Take raw 1-D signal values, pad/trim, reshape for the CNN model."""
    processed = add_gaussian_noise(raw_values, TARGET_LENGTH)
    return processed.reshape(1, TARGET_LENGTH, 1)


# ---------------------------------------------------------------------------
# Explainability (Occlusion Sensitivity)
# ---------------------------------------------------------------------------
def explain_prediction(model, signal, target_class_idx, window_size=10, stride=5):
    """
    Generate an importance heatmap using occlusion sensitivity.
    We slide a zero-mask over the signal and measure the drop in confidence.
    Higher drop = Higher importance.
    """
    heatmap = np.zeros_like(signal)
    counts = np.zeros_like(signal)

    # Base prediction probability for the target class
    # Use batch prediction to speed up
    # Create batch of occluded signals
    occluded_batch = []
    
    # Base prediction
    X_base = preprocess_signal(signal)
    base_pred = model.predict(X_base, verbose=0)[0][target_class_idx]
    
    indices = []
    for i in range(0, len(signal) - window_size, stride):
        # Create occluded signal
        occluded = signal.copy()
        occluded[i : i + window_size] = 0  # Mask with zeros (baseline)
        occluded_batch.append(preprocess_signal(occluded)[0])
        indices.append(i)
    
    # Predict on batch
    if occluded_batch:
        X_batch = np.array(occluded_batch)
        preds = model.predict(X_batch, verbose=0)
        
        for idx, i in enumerate(indices):
            pred = preds[idx][target_class_idx]
            importance = max(0, base_pred - pred)
            heatmap[i : i + window_size] += importance
            counts[i : i + window_size] += 1

    # Average and normalize
    safe_counts = np.maximum(counts, 1e-7)
    heatmap = heatmap / safe_counts
    
    # Min-max scaling
    h_min, h_max = np.min(heatmap), np.max(heatmap)
    if h_max > h_min:
        heatmap = (heatmap - h_min) / (h_max - h_min)
    
    return heatmap.tolist()


def extract_features(signal, fs=125):
    """
    Extract basic features from the ECG signal (R-peaks, RR intervals, Heart Rate).
    Note: MIT-BIH is originally 360Hz, but if this is a snippet, we assume 
    roughly 125Hz or resampled. We will use a simple heuristic.
    """
    # Simple R-peak detection based on threshold
    # Normalize signal
    sig_min, sig_max = np.min(signal), np.max(signal)
    if sig_max - sig_min == 0:
        return {"bpm": 0, "rr_avg": 0, "amplitude": 0}
        
    norm_signal = (signal - sig_min) / (sig_max - sig_min)
    
    # Threshold for R-peaks (e.g., 0.6)
    peaks = []
    threshold = 0.6
    for i in range(1, len(norm_signal) - 1):
        if norm_signal[i] > threshold and \
           norm_signal[i] > norm_signal[i-1] and \
           norm_signal[i] > norm_signal[i+1]:
            # simple local max above threshold
            if len(peaks) == 0 or (i - peaks[-1]) > (0.2 * fs): # refractory period ~200ms
                peaks.append(i)
                
    features = {
        "bpm": 0,
        "rr_avg": 0,
        "amplitude": round(sig_max - sig_min, 3),
        "peak_count": len(peaks)
    }
    
    if len(peaks) > 1:
        rr_intervals = np.diff(peaks)
        rr_avg_samples = np.mean(rr_intervals)
        rr_avg_sec = rr_avg_samples / fs
        bpm = 60.0 / rr_avg_sec if rr_avg_sec > 0 else 0
        
        features["bpm"] = int(round(bpm))
        features["rr_avg"] = int(round(rr_avg_sec * 1000)) # ms
        
    return features


@app.route("/api/explain", methods=["POST"])
def explain():
    """Explain a specific ECG prediction using occlusion sensitivity AND LLM text."""
    model = get_model()
    data = request.get_json()
    signal = data.get("signal")
    if not signal:
        return jsonify({"error": "Missing signal"}), 400
        
    signal_arr = np.array(signal, dtype=np.float64)
    label_idx = int(data.get("label", 0))
    
    # 1. Visual Explanation (Heatmap)
    heatmap = explain_prediction(model, signal_arr, label_idx)
    
    # 2. Textual Explanation (LLM)
    # Extract features for context
    feats = extract_features(signal_arr)
    
    beat_type = CLASS_MAPPING.get(label_idx, "Unknown")
    severity = CLASS_SEVERITY.get(label_idx, "unknown")
    
    explanation_prompt = (
        f"Act as an expert cardiologist explaining an ECG finding to a patient. "
        f"The ECG analysis has detected: '{beat_type}' (Severity: {severity}).\n"
        f"**Signal Metrics** derived from this specific heartbeat:\n"
        f"- Estimated Heart Rate: ~{feats['bpm']} BPM\n"
        f"- Average R-R Interval: ~{feats['rr_avg']} ms\n"
        f"- QRS Amplitude (approx): {feats['amplitude']} units\n\n"
        f"Please provide a detailed explanation structured as follows:\n"
        f"1. **Analysis of THIS Signal**: Interpret the metrics above. Is the heart rate normal, tachycardic, or bradycardic? Is the R-R interval regular? "
        f"Does this support the diagnosis of {beat_type}?\n"
        f"2. **Comparison with Normal Heartbeat**: Compare the structure of a Normal Sinus Rhythm (clear P-wave, regular rhythm, 60-100 BPM) "
        f"with this specific detected arrhythmia. Highlight differences in P-waves, QRS width, or morphology.\n"
        f"3. **Clinical Implication**: Briefly mention if this is generally benign or requires attention (based on Severity: {severity}).\n\n"
        f"Keep the tone reassuring but clinical and precise. Use bullet points for clarity."
    )
    
    explanation_text = get_llm_response(explanation_prompt)

    # Cleanup
    if "model" in locals():
        del model
    tf.keras.backend.clear_session()
    gc.collect()
    
    return jsonify({
        "heatmap": heatmap,
        "explanation_text": explanation_text
    })


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "model_accuracy": MODEL_ACCURACY})



# ---------------------------------------------------------------------------
# Image Digitizer Integration
# ---------------------------------------------------------------------------
import digitizer

@app.route("/api/predict/image", methods=["POST"])
def predict_image():
    """Extract signal from ECG image and predict."""
    if "file" not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400
        
    file = request.files["file"]
    try:
        # Extract signal using digitizer
        raw_signal = digitizer.process_image(file.stream)
        
        # Preprocess and Predict
        model = get_model()
        X = preprocess_signal(raw_signal)
        predictions = model.predict(X)
        
        label_idx = int(np.argmax(predictions, axis=1)[0])
        confidence = float(np.max(predictions[0]) * 100)
        
        # Calculate SQI
        smoothed = np.convolve(raw_signal, np.ones(5)/5, mode='same')
        noise = raw_signal - smoothed
        snr = np.std(raw_signal) / (np.std(noise) + 1e-6)
        
        sqi_quality = "Good"
        if snr < 2.0: sqi_quality = "Poor"
        elif snr < 5.0: sqi_quality = "Fair"

        # Cleanup
        if "model" in locals(): del model
        tf.keras.backend.clear_session()
        gc.collect()

        return jsonify({
            "label": label_idx,
            "beat_type": CLASS_MAPPING[label_idx],
            "description": CLASS_DESCRIPTIONS[label_idx],
            "severity": CLASS_SEVERITY[label_idx],
            "confidence": round(confidence, 2),
            "signal": raw_signal.tolist(),
            "sqi_quality": sqi_quality,
            "snr_value": round(snr, 2),
            "model_accuracy": MODEL_ACCURACY,
            "probabilities": {
                CLASS_MAPPING[i]: round(float(p) * 100, 2)
                for i, p in enumerate(predictions[0])
            },
        })

    except Exception as e:
        return jsonify({"error": f"Image processing failed: {str(e)}"}), 500


@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Accept ECG data and return arrhythmia prediction.

    Supports two modes:
      1. JSON body with `signal` (array of numbers)
      2. CSV file upload with optional `row` parameter
    """
    model = get_model()

    # --- Mode 1: JSON signal array ------------------------------------
    if request.is_json:
        data = request.get_json()
        signal = data.get("signal")
        if signal is None:
            return jsonify({"error": "Missing 'signal' field"}), 400
        raw = np.array(signal, dtype=np.float64)
        X = preprocess_signal(raw)
        predictions = model.predict(X)
        label_idx = int(np.argmax(predictions, axis=1)[0])
        confidence = float(np.max(predictions[0]) * 100)

        # Cleanup Memory
        if "model" in locals():
            del model
        tf.keras.backend.clear_session()
        gc.collect()

        return jsonify(
            {
                "label": label_idx,
                "beat_type": CLASS_MAPPING[label_idx],
                "description": CLASS_DESCRIPTIONS[label_idx],
                "severity": CLASS_SEVERITY[label_idx],
                "confidence": round(confidence, 2),
                "signal": raw.tolist(),
                "model_accuracy": MODEL_ACCURACY,
                "probabilities": {
                    CLASS_MAPPING[i]: round(float(p) * 100, 2)
                    for i, p in enumerate(predictions[0])
                },
            }
        )

    # --- Mode 2: CSV file upload --------------------------------------
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    row = int(request.form.get("row", 0))

    try:
        content = file.read().decode("utf-8")
        df = pd.read_csv(io.StringIO(content), header=None)
    except Exception as e:
        return jsonify({"error": f"Failed to parse CSV: {str(e)}"}), 400

    if row < 0 or row >= len(df):
        return jsonify(
            {"error": f"Row {row} out of range. File has {len(df)} rows."}
        ), 400

    # Extract 186 columns (the model input)
    raw = df.iloc[row, :TARGET_LENGTH].values.astype(np.float64)
    X = preprocess_signal(raw)

    predictions = model.predict(X)
    label_idx = int(np.argmax(predictions, axis=1)[0])
    confidence = float(np.max(predictions[0]) * 100)

    # Calculate SQI (Signal Quality Index) using SNR approximation
    smoothed = np.convolve(raw, np.ones(5)/5, mode='same')
    noise = raw - smoothed
    snr = np.std(raw) / (np.std(noise) + 1e-6)
    
    sqi_quality = "Good"
    if snr < 2.0:
        sqi_quality = "Poor"
    elif snr < 5.0:
        sqi_quality = "Fair"

    # Capture metrics before cleanup
    total_rows = len(df)

    # Cleanup Memory
    if "model" in locals():
        del model
    if "df" in locals():
        del df
    tf.keras.backend.clear_session()
    gc.collect()

    return jsonify(
        {
            "label": label_idx,
            "beat_type": CLASS_MAPPING[label_idx],
            "description": CLASS_DESCRIPTIONS[label_idx],
            "severity": CLASS_SEVERITY[label_idx],
            "confidence": round(confidence, 2),
            "signal": raw.tolist(),
            "total_rows": total_rows,
            "analyzed_row": row,
            "sqi_quality": sqi_quality,
            "snr_value": round(snr, 2),
            "model_accuracy": MODEL_ACCURACY,
            "probabilities": {
                CLASS_MAPPING[i]: round(float(p) * 100, 2)
                for i, p in enumerate(predictions[0])
            },
        }
    )


@app.route("/api/predict/batch", methods=["POST"])
def predict_batch():
    """Predict multiple rows from a CSV upload."""
    model = get_model()

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    start_row = int(request.form.get("start_row", 0))
    end_row = int(request.form.get("end_row", -1))

    try:
        content = file.read().decode("utf-8")
        df = pd.read_csv(io.StringIO(content), header=None)
    except Exception as e:
        return jsonify({"error": f"Failed to parse CSV: {str(e)}"}), 400

    if end_row == -1 or end_row >= len(df):
        end_row = len(df) - 1

    results = []
    for row in range(start_row, end_row + 1):
        raw = df.iloc[row, :TARGET_LENGTH].values.astype(np.float64)
        X = preprocess_signal(raw)
        predictions = model.predict(X, verbose=0)
        label_idx = int(np.argmax(predictions, axis=1)[0])
        confidence = float(np.max(predictions[0]) * 100)
        results.append(
            {
                "row": row,
                "label": label_idx,
                "beat_type": CLASS_MAPPING[label_idx],
                "severity": CLASS_SEVERITY[label_idx],
                "confidence": round(confidence, 2),
            }
        )

    return jsonify(
        {
            "results": results,
            "total_rows": len(df),
            "analyzed_range": [start_row, end_row],
            "model_accuracy": MODEL_ACCURACY,
        }
    )


@app.route("/api/sample", methods=["GET"])
def sample_data():
    """Return a sample ECG signal for demo/testing purposes."""
    sample_path = os.path.join(os.path.dirname(__file__), "sample.csv")
    if not os.path.exists(sample_path):
        return jsonify({"error": "Sample data not available"}), 404

    df = pd.read_csv(sample_path, header=None)
    row = int(request.args.get("row", 0))
    if row >= len(df):
        row = 0

    raw = df.iloc[row, :TARGET_LENGTH].values.astype(np.float64)
    return jsonify(
        {
            "signal": raw.tolist(),
            "total_rows": len(df),
            "row": row,
        }
    )


@app.route("/api/chat", methods=["POST"])
def chat():
    """LLM-powered chat endpoint for ECG-related questions."""
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Missing 'message' field"}), 400

    user_message = data["message"]
    context = data.get("context")

    response_text = get_llm_response(user_message, context)
    return jsonify({"response": response_text})


@app.route("/api/classes", methods=["GET"])
def get_classes():
    """Return all arrhythmia class info."""
    classes = []
    for idx in CLASS_MAPPING:
        classes.append(
            {
                "label": idx,
                "name": CLASS_MAPPING[idx],
                "description": CLASS_DESCRIPTIONS[idx],
                "severity": CLASS_SEVERITY[idx],
            }
        )
    return jsonify({"classes": classes, "model_accuracy": MODEL_ACCURACY})


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
