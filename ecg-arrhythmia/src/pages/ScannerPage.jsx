import { useState, useCallback } from 'react';
import { Activity, Loader2, RotateCcw, Database, Hash, Image } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ResultCard from '../components/ResultCard';
import { predictFromCSV, getSampleData, predictFromSignal, predictFromImage } from '../services/api';
import './ScannerPage.css';

export default function ScannerPage({ onAnalysisComplete }) {
    const [file, setFile] = useState(null);
    const [row, setRow] = useState(0);
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState('upload'); // upload | analyzing | result

    const handleFileSelect = useCallback((selectedFile) => {
        setFile(selectedFile);
        setResult(null);
        setError(null);
    }, []);

    const handleAnalyze = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setStep('analyzing');

        try {
            let data;
            if (file.type.startsWith('image/')) {
                data = await predictFromImage(file);
            } else {
                data = await predictFromCSV(file, row);
            }

            setResult(data);
            setStep('result');

            // Pass context to parent for CardioAI
            if (onAnalysisComplete) {
                onAnalysisComplete({
                    beat_type: data.beat_type,
                    confidence: data.confidence,
                    severity: data.severity,
                });
            }
        } catch (err) {
            setError(err.message);
            setStep('upload');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadSample = async () => {
        setIsLoading(true);
        setError(null);
        setStep('analyzing');

        try {
            const sampleData = await getSampleData(0);
            const prediction = await predictFromSignal(sampleData.signal);
            setResult(prediction);
            setStep('result');

            if (onAnalysisComplete) {
                onAnalysisComplete({
                    beat_type: prediction.beat_type,
                    confidence: prediction.confidence,
                    severity: prediction.severity,
                });
            }
        } catch (err) {
            setError(err.message);
            setStep('upload');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setRow(0);
        setResult(null);
        setError(null);
        setStep('upload');
    };

    return (
        <div className="scanner-page">
            <div className="scanner-bg">
                <div className="scanner-grid" />
            </div>

            <div className="container">
                {/* Page Header */}
                <div className="scanner-header animate-fade-in">
                    <div className="scanner-header-icon">
                        <Activity size={28} />
                    </div>
                    <h1>HeartAlert <span className="text-gradient">AI</span></h1>
                    <p>Upload your ECG data for instant AI-powered arrhythmia detection</p>
                </div>

                {/* Upload / Analyzing / Result */}
                {step === 'upload' && (
                    <div className="scanner-upload animate-fade-in">
                        <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

                        {file && (
                            <div className="scanner-controls glass-card animate-fade-in">
                                {!file.type.startsWith('image/') && (
                                    <div className="control-group">
                                        <label htmlFor="row-input" className="control-label">
                                            <Hash size={16} />
                                            Row Number
                                        </label>
                                        <input
                                            id="row-input"
                                            type="number"
                                            className="input"
                                            value={row}
                                            onChange={(e) => setRow(parseInt(e.target.value) || 0)}
                                            min={0}
                                            placeholder="Enter row number"
                                        />
                                        <span className="control-hint">Zero-indexed row from the CSV file</span>
                                    </div>
                                )}

                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleAnalyze}
                                    disabled={isLoading}
                                    id="analyze-btn"
                                >
                                    <Activity size={20} />
                                    {file.type.startsWith('image/') ? 'Analyze Image' : 'Analyze ECG Signal'}
                                </button>
                            </div>
                        )}

                        <div className="scanner-divider">
                            <span>or</span>
                        </div>

                        <button
                            className="btn btn-secondary btn-lg sample-btn"
                            onClick={handleLoadSample}
                            disabled={isLoading}
                            id="sample-btn"
                        >
                            <Database size={20} />
                            Load Sample ECG Data
                        </button>

                        {error && (
                            <div className="scanner-error glass-card animate-fade-in">
                                <p>⚠️ {error}</p>
                                <p className="error-hint">
                                    Make sure the Flask backend is running on port 5000.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {step === 'analyzing' && (
                    <div className="scanner-loading animate-fade-in">
                        <div className="loading-card glass-card">
                            <div className="loading-animation">
                                <div className="ecg-pulse-ring" />
                                <Activity size={40} className="loading-icon" />
                            </div>
                            <h2>Analyzing ECG Signal...</h2>
                            <p>Processing signal through our 1D-CNN deep learning model</p>
                            <div className="loading-steps">
                                <div className="loading-step active">
                                    <Loader2 size={14} className="spinner-icon" />
                                    <span>Reading signal data</span>
                                </div>
                                <div className="loading-step">
                                    <span className="step-dot" />
                                    <span>Preprocessing & noise reduction</span>
                                </div>
                                <div className="loading-step">
                                    <span className="step-dot" />
                                    <span>Running CNN inference</span>
                                </div>
                                <div className="loading-step">
                                    <span className="step-dot" />
                                    <span>Generating results</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'result' && result && (
                    <div className="scanner-result animate-fade-in">
                        <div className="result-actions">
                            <button className="btn btn-secondary" onClick={handleReset} id="reset-btn">
                                <RotateCcw size={18} />
                                New Scan
                            </button>
                        </div>
                        <ResultCard result={result} />
                    </div>
                )}
            </div>
        </div>
    );
}
