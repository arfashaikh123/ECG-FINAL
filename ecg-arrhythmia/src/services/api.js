const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error('Backend not reachable');
  return res.json();
}

export async function predictFromCSV(file, row = 0) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('row', row.toString());

  const res = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Prediction failed');
  }
  return res.json();
}

export async function predictFromSignal(signal) {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signal }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Prediction failed');
  }
  return res.json();
}

export async function predictBatch(file, startRow = 0, endRow = -1) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('start_row', startRow.toString());
  formData.append('end_row', endRow.toString());

  const res = await fetch(`${API_BASE}/api/predict/batch`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Batch prediction failed');
  }
  return res.json();
}

export async function getSampleData(row = 0) {
  const res = await fetch(`${API_BASE}/api/sample?row=${row}`);
  if (!res.ok) throw new Error('Failed to fetch sample data');
  return res.json();
}

export async function chatWithAI(message, context = null) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Chat failed');
  }
  return res.json();
}

export async function getClasses() {
  const res = await fetch(`${API_BASE}/api/classes`);
  if (!res.ok) throw new Error('Failed to fetch class info');
  return res.json();
}

export async function explainPrediction(signal, label) {
  const res = await fetch(`${API_BASE}/api/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signal, label }),
  });
  if (!res.ok) throw new Error('Explain failed');
  return res.json();
}
