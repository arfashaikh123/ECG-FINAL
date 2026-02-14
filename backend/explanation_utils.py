
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
    base_pred = model.predict(signal.reshape(1, TARGET_LENGTH, 1), verbose=0)[0][target_class_idx]
    
    for i in range(0, len(signal) - window_size, stride):
        # Create occluded signal
        occluded = signal.copy()
        occluded[i : i + window_size] = 0  # Mask with zeros
        
        # Predict on occluded signal
        pred = model.predict(occluded.reshape(1, TARGET_LENGTH, 1), verbose=0)[0][target_class_idx]
        
        # Importance = Drop in confidence
        importance = max(0, base_pred - pred)
        
        # Accumulate importance
        heatmap[i : i + window_size] += importance
        counts[i : i + window_size] += 1

    # Average and normalize
    heatmap = heatmap / (counts + 1e-7)
    heatmap = (heatmap - np.min(heatmap)) / (np.max(heatmap) - np.min(heatmap) + 1e-7)
    
    return heatmap.tolist()

@app.route("/api/explain", methods=["POST"])
def explain():
    """Explain a specific ECG prediction."""
    model = get_model()
    data = request.get_json()
    signal = np.array(data.get("signal"), dtype=np.float64)
    label_idx = int(data.get("label"))
    
    heatmap = explain_prediction(model, signal, label_idx)
    
    # Cleanup
    if "model" in locals():
        del model
    tf.keras.backend.clear_session()
    gc.collect()
    
    return jsonify({"heatmap": heatmap})
