
import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Database, Shield, Zap, Heart, Play, RefreshCw, BarChart } from 'lucide-react';
import './AboutPage.css';

// A representative ECG segment (186 points)
const SAMPLE_INPUT = [0, 0, 0, 0.05, 0.1, 0.2, 0.1, 0.05, 0, 0, 0.1, 0.3, 0.6, 1.0, 0.5, 0.2, 0.1, 0, 0, -0.05, -0.1, 0, 0.1, 0.2, 0.2, 0.1, 0, 0, 0];

export default function AboutPage() {
    const [isSimulating, setIsSimulating] = useState(false);
    const [activeStep, setActiveStep] = useState(-1);

    const steps = [
        { id: 'input', label: 'Input Signal' },
        { id: 'conv1', label: 'Feature Extraction 1' },
        { id: 'conv2', label: 'Feature Extraction 2' },
        { id: 'conv3', label: 'Feature Extraction 3' },
        { id: 'dense', label: 'Flatten & Classify' },
        { id: 'output', label: 'Result Prediction' }
    ];

    const startSimulation = () => {
        if (isSimulating) return;
        setIsSimulating(true);
        setActiveStep(0);
    };

    useEffect(() => {
        if (isSimulating && activeStep < steps.length) {
            const timer = setTimeout(() => {
                setActiveStep(prev => prev + 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (activeStep === steps.length) {
            setTimeout(() => {
                setIsSimulating(false);
                setActiveStep(-1);
            }, 1500);
        }
    }, [isSimulating, activeStep]);

    // Helper to render mini-charts for each layer
    const renderMiniChart = (type) => {
        switch (type) {
            case 'input':
                return (
                    <svg viewBox="0 0 100 40" className="mini-chart">
                        <polyline
                            points="0,20 10,20 20,20 25,15 30,20 35,20 40,5 45,35 50,20 60,20 70,10 80,20 90,20 100,20"
                            fill="none" stroke="#60a5fa" strokeWidth="2"
                        />
                    </svg>
                );
            case 'conv1':
                return (
                    <svg viewBox="0 0 100 40" className="mini-chart">
                        <polyline
                            points="0,25 10,24 20,20 30,15 40,25 50,30 60,20 70,10 80,15 90,22 100,25"
                            fill="none" stroke="#a78bfa" strokeWidth="3"
                        />
                    </svg>
                );
            case 'conv2':
                return (
                    <svg viewBox="0 0 100 40" className="mini-chart">
                        <path d="M0,30 Q10,5 20,30 T40,30 T60,30 T80,30 T100,30" fill="none" stroke="#f472b6" strokeWidth="2" />
                    </svg>
                );
            case 'conv3':
                return (
                    <div className="mini-grid">
                        <div className="grid-dot active"></div>
                        <div className="grid-dot"></div>
                        <div className="grid-dot active"></div>
                        <div className="grid-dot"></div>
                        <div className="grid-dot"></div>
                        <div className="grid-dot active"></div>
                    </div>
                );
            case 'dense':
                return (
                    <div className="mini-bars">
                        <div className="bar" style={{ height: '70%' }}></div>
                        <div className="bar" style={{ height: '40%' }}></div>
                        <div className="bar" style={{ height: '90%' }}></div>
                        <div className="bar" style={{ height: '50%' }}></div>
                    </div>
                );
            case 'output':
                return (
                    <div className="mini-output">
                        <div className="output-row active">
                            <span>N</span>
                            <div className="row-fill" style={{ width: '98%' }}></div>
                        </div>
                        <div className="output-row">
                            <span>S</span>
                            <div className="row-fill" style={{ width: '2%' }}></div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="about-page animate-fade-in">
            <div className="container">
                <div className="about-header text-center">
                    <h1>About <span className="text-gradient">Heart</span>AI</h1>
                    <p className="lead">Pioneering AI-driven cardiac health monitoring.</p>
                </div>

                <div className="ecg-education-section glass-card">
                    <h2><Activity className="icon-red" size={24} /> Understanding ECG</h2>
                    <div className="ecg-content-wrapper">
                        <div className="ecg-visualizer">
                            <svg viewBox="0 0 500 150" className="ecg-svg">
                                <polyline
                                    points="0,75 50,75 70,60 90,75 110,75 125,20 140,110 155,75 180,75 200,65 230,75 280,75 330,75 350,60 370,75 390,75 405,20 420,110 435,75 460,75 480,65 500,75"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="ecg-line-anim"
                                />
                            </svg>
                            <div className="ecg-labels">
                                <span className="label-text" style={{ left: '14%' }}>P</span>
                                <span className="label-text" style={{ left: '27%' }}>QRS</span>
                                <span className="label-text" style={{ left: '42%' }}>T</span>
                                <span className="label-text" style={{ left: '70%' }}>P</span>
                                <span className="label-text" style={{ left: '83%' }}>QRS</span>
                                <span className="label-text" style={{ left: '96%' }}>T</span>
                            </div>
                        </div>
                        <div className="ecg-explanation">
                            <p>
                                An <strong>Electrocardiogram (ECG)</strong> records the electrical signals in your heart.
                                Each beat produces a specific wave pattern:
                            </p>
                            <ul>
                                <li><strong className="text-highlight">P Wave:</strong> Atrial depolarization (upper chambers contract).</li>
                                <li><strong className="text-highlight">QRS Complex:</strong> Ventricular depolarization (lower chambers contract).</li>
                                <li><strong className="text-highlight">T Wave:</strong> Ventricular repolarization (lower chambers relax).</li>
                            </ul>
                            <p className="small-text">
                                Our AI analyzes the subtle variations in these intervals and amplitudes to detect arrhythmias
                                invisible to the naked eye.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="about-section glass-card">
                    <h2><Activity className="icon-blue" size={24} /> The Mission</h2>
                    <p>
                        HeartAI is designed to democratize access to advanced cardiac arrhythmia detection.
                        By leveraging state-of-the-art deep learning technology, we aim to provide instant,
                        accurate preliminary screenings for common heart rhythm abnormalities, acting as a powerful
                        assistant to healthcare professionals and students.
                    </p>
                </div>

                <div className="about-grid">
                    <div className="about-card glass-card">
                        <h3><Cpu className="icon-purple" size={24} /> 1D-CNN Model Architecture</h3>
                        <p>
                            The core inference engine utilizes a deep <strong>1-Dimensional Convolutional Neural Network (1D-CNN)</strong> optimized for time-series ECG signal classification.
                            The topological structure comprises a sequential stack of three convolutional blocks designed for hierarchical feature extraction.
                            Each block encapsulates a 1D Convolutional layer (64 filters) for temporal pattern recognition, Batch Normalization for distribution stability,
                            and Max Pooling for dimensionality reduction. The feature extraction phase culminates in a fully connected dense classifier (64 and 32 units)
                            utilizing ReLU activation functions for non-linear decision boundaries.
                        </p>
                    </div>
                    <div className="about-card glass-card">
                        <h3><Database className="icon-green" size={24} /> Training Data</h3>
                        <p>
                            The model was rigorously trained and validated using the <strong>MIT-BIH Arrhythmia Database</strong>,
                            the gold standard dataset for cardiac arrhythmia research. It includes 48 half-hour excerpts
                            of two-channel ambulatory ECG recordings from 47 subjects.
                        </p>
                    </div>
                </div>

                <div className="tech-stack-section glass-card">
                    <div className="section-header-flex">
                        <h2><Zap className="icon-yellow" size={24} /> Architectural Design</h2>
                        <button
                            className={`btn btn-sim ${isSimulating ? 'simulating' : ''}`}
                            onClick={startSimulation}
                            disabled={isSimulating}
                        >
                            {isSimulating ? (
                                <><RefreshCw className="icon-spin" size={18} /> Simulating...</>
                            ) : (
                                <><Play size={18} /> Simulate Inference</>
                            )}
                        </button>
                    </div>

                    <div className="architecture-diagram tech-schematic">
                        {/* Simulation Progress Info */}
                        {isSimulating && activeStep >= 0 && activeStep < steps.length && (
                            <div className="sim-status-overlay">
                                <span className="status-badge">Phase: {steps[activeStep].label}</span>
                            </div>
                        )}

                        {/* Input */}
                        <div className={`layer-block input-layer ${activeStep === 0 ? 'active' : ''}`}>
                            <span className="layer-title">Input</span>
                            <div className="layer-content">
                                <div className="static-preview">
                                    {renderMiniChart('input')}
                                </div>
                                <span className="tensor-shape">(186, 1)</span>
                                <span className="layer-desc">ECG Signal</span>
                            </div>
                            {activeStep === 0 && <div className="data-pulse" />}
                        </div>

                        <div className={`flow-arrow ${activeStep >= 0 && activeStep <= 1 ? 'active' : ''}`}>➜</div>

                        {/* Block 1 */}
                        <div className={`layer-block conv-block ${activeStep === 1 ? 'active' : ''}`}>
                            <span className="layer-title">Conv Block 1</span>
                            <div className="layer-content">
                                <div className="static-preview">
                                    {renderMiniChart('conv1')}
                                </div>
                                <div className="sub-layer">Conv1D <span className="params">(64, k=6)</span></div>
                                <div className="sub-layer">Batch Norm</div>
                                <div className="sub-layer">MaxPool <span className="params">(3, s=2)</span></div>
                                <span className="tensor-shape output-shape">Output: (93, 64)</span>
                            </div>
                            {activeStep === 1 && <div className="data-pulse" />}
                        </div>

                        <div className={`flow-arrow ${activeStep >= 1 && activeStep <= 2 ? 'active' : ''}`}>➜</div>

                        {/* Block 2 */}
                        <div className={`layer-block conv-block ${activeStep === 2 ? 'active' : ''}`}>
                            <span className="layer-title">Conv Block 2</span>
                            <div className="layer-content">
                                <div className="static-preview">
                                    {renderMiniChart('conv2')}
                                </div>
                                <div className="sub-layer">Conv1D <span className="params">(64, k=3)</span></div>
                                <div className="sub-layer">Batch Norm</div>
                                <div className="sub-layer">MaxPool <span className="params">(2, s=2)</span></div>
                                <span className="tensor-shape output-shape">Output: (46, 64)</span>
                            </div>
                            {activeStep === 2 && <div className="data-pulse" />}
                        </div>

                        <div className={`flow-arrow ${activeStep >= 2 && activeStep <= 3 ? 'active' : ''}`}>➜</div>

                        {/* Block 3 */}
                        <div className={`layer-block conv-block ${activeStep === 3 ? 'active' : ''}`}>
                            <span className="layer-title">Conv Block 3</span>
                            <div className="layer-content">
                                <div className="static-preview">
                                    {renderMiniChart('conv3')}
                                </div>
                                <div className="sub-layer">Conv1D <span className="params">(64, k=3)</span></div>
                                <div className="sub-layer">Batch Norm</div>
                                <div className="sub-layer">MaxPool <span className="params">(2, s=2)</span></div>
                                <span className="tensor-shape output-shape">Output: (23, 64)</span>
                            </div>
                            {activeStep === 3 && <div className="data-pulse" />}
                        </div>

                        <div className={`flow-arrow ${activeStep >= 3 && activeStep <= 4 ? 'active' : ''}`}>➜</div>

                        {/* Dense Block */}
                        <div className={`layer-block dense-block ${activeStep === 4 ? 'active' : ''}`}>
                            <span className="layer-title">Classification</span>
                            <div className="layer-content">
                                <div className="static-preview">
                                    {renderMiniChart('dense')}
                                </div>
                                <div className="sub-layer">Flatten <span className="params">(1472)</span></div>
                                <div className="sub-layer">Dense <span className="params">(64, ReLU)</span></div>
                                <div className="sub-layer">Dense <span className="params">(32, ReLU)</span></div>
                            </div>
                            {activeStep === 4 && <div className="data-pulse" />}
                        </div>

                        <div className={`flow-arrow ${activeStep >= 4 && activeStep <= 5 ? 'active' : ''}`}>➜</div>

                        {/* Output */}
                        <div className={`layer-block output-layer ${activeStep === 5 ? 'active' : ''}`}>
                            <span className="layer-title">Output</span>
                            <div className="layer-content">
                                <div className="static-preview">
                                    {renderMiniChart('output')}
                                </div>
                                <span className="tensor-shape">Softmax</span>
                                <span className="layer-desc">5 Classes</span>
                            </div>
                            {activeStep === 5 && <div className="data-pulse" />}
                        </div>
                    </div>
                </div>

                <div className="disclaimer-section glass-card">
                    <h3><Shield className="icon-red" size={24} /> Medical Disclaimer</h3>
                    <p>
                        HeartAI is a research and educational tool. <strong>It is not a replacement for professional medical advice,
                            diagnosis, or treatment.</strong> Always seek the advice of your physician or qualified health provider
                        with any questions you may have regarding a medical condition.
                    </p>
                </div>
            </div>
        </div>
    );
}
