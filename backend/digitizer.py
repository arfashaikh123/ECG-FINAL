import cv2
import numpy as np

def process_image(file_stream):
    """
    Process an ECG image stream to extract a normalized 1D signal.
    """
    # Read image from file stream
    file_bytes = np.asarray(bytearray(file_stream.read()), dtype=np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Could not decode image")

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Thresholding to isolate the black trace
    # Assuming the trace is darker than background (grid)
    # Using adaptive threshold or simple binary threshold
    _, binary = cv2.threshold(gray, 120, 255, cv2.THRESH_BINARY_INV)

    # Find coordinates of dark pixels
    points = np.column_stack(np.where(binary > 0))

    # If no points found (blank image?)
    if len(points) == 0:
        raise ValueError("No ECG trace detected in image")

    # Sort by X coordinate (column index)
    # points[:, 1] is X (column), points[:, 0] is Y (row)
    # We want to map X -> Y value
    # Since multiple Ys might exist for one X (thick line), we take mean or median Y
    
    # Dict to store Y values for each X
    x_y_map = {}
    for y, x in points:
        if x not in x_y_map:
            x_y_map[x] = []
        x_y_map[x].append(y)
    
    # Extract mean Y for each unique X
    sorted_x = sorted(x_y_map.keys())
    extracted_signal = []
    
    for x in sorted_x:
        ys = x_y_map[x]
        # Invert Y because image coordinates (0,0) is top-left, but graph (0,0) is bottom-left
        # Actually ECG is just signal, inversion relative to image height
        avg_y = np.mean(ys)
        extracted_signal.append(-avg_y) 

    extracted_signal = np.array(extracted_signal)

    # Normalize signal to -1 to 1 range (approx) via Z-score or MinMax
    # Better: MinMax scaling to 0-1 then shift to -0.5 to 0.5?
    # Our model expects variance ~1. Let's use Z-score.
    extracted_signal = (extracted_signal - np.mean(extracted_signal)) / (np.std(extracted_signal) + 1e-6)

    # Resample to TARGET_LENGTH (186)
    target_length = 186
    if len(extracted_signal) != target_length:
        from scipy.signal import resample
        # Start and end might be noise. We assume image is mostly ECG.
        extracted_signal = resample(extracted_signal, target_length)

    return extracted_signal
