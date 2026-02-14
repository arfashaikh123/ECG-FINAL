import {
    Heart,
    Activity,
    Zap,
    Shield,
    BarChart3,
    Brain,
    ArrowRight,
    ChevronRight,
    Cpu,
    Stethoscope,
    FileSpreadsheet,
} from 'lucide-react';
import ECGChart from '../components/ECGChart';
import './HomePage.css';

// A sample ECG-like signal for hero animation
const DEMO_SIGNAL = Array.from({ length: 186 }, (_, i) => {
    const x = i / 186;
    const qrs = Math.exp(-Math.pow((x - 0.4) * 20, 2)) * 1.0;
    const pWave = Math.exp(-Math.pow((x - 0.25) * 12, 2)) * 0.2;
    const tWave = Math.exp(-Math.pow((x - 0.6) * 8, 2)) * 0.3;
    const noise = (Math.random() - 0.5) * 0.02;
    return pWave + qrs + tWave + noise + 0.15;
});

export default function HomePage({ onNavigate }) {
    const features = [
        {
            icon: Brain,
            title: '2D CNN Deep Learning',
            desc: 'Advanced Convolutional Neural Network trained on the MIT-BIH Arrhythmia Database for accurate beat classification.',
            color: '#06d6a0',
        },
        {
            icon: BarChart3,
            title: 'Real-Time Visualization',
            desc: 'Interactive ECG signal plotting with detailed probability distributions and histogram analysis.',
            color: '#118ab2',
        },
        {
            icon: Shield,
            title: '86.12% Accuracy',
            desc: 'High-precision arrhythmia detection across 5 beat categories validated against clinical ECG data.',
            color: '#ffd166',
        },
        {
            icon: Zap,
            title: 'AI-Powered Insights',
            desc: 'Integrated LLM assistant (CardioAI) for intelligent ECG interpretation and cardiac health guidance.',
            color: '#8b5cf6',
        },
    ];

    const beatTypes = [
        { name: 'Normal', severity: 'normal', icon: Heart, desc: 'Sinus rhythm — healthy, regular heartbeats from the SA node.' },
        { name: 'Supraventricular', severity: 'warning', icon: Activity, desc: 'Abnormal beats originating above the ventricles.' },
        { name: 'Ventricular', severity: 'danger', icon: Activity, desc: 'Premature beats from the lower chambers — can be serious.' },
        { name: 'Fusion', severity: 'caution', icon: Stethoscope, desc: 'Combined normal and premature beat characteristics.' },
        { name: 'Unknown', severity: 'unknown', icon: Cpu, desc: 'Unclassified rhythms requiring further analysis.' },
    ];

    const steps = [
        { num: '01', title: 'Upload ECG Data', desc: 'Upload a CSV file with ECG signal data in MIT-BIH format.', icon: FileSpreadsheet },
        { num: '02', title: 'AI Analysis', desc: 'Our 2D CNN model processes and classifies the heartbeat signal.', icon: Brain },
        { num: '03', title: 'Get Results', desc: 'View detailed classification, confidence scores, and visualizations.', icon: BarChart3 },
        { num: '04', title: 'Ask CardioAI', desc: 'Chat with our AI assistant for deeper insights and guidance.', icon: Zap },
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-grid" />
                    <div className="hero-gradient" />
                </div>

                <div className="hero-content container">
                    <div className="hero-text animate-fade-in">
                        <div className="hero-badge">
                            <Zap size={14} />
                            AI-Powered ECG Analysis
                        </div>
                        <h1>
                            Detect Heart <br />
                            <span className="text-gradient">Arrhythmias</span> with AI
                        </h1>
                        <p className="hero-subtitle">
                            Advanced deep learning model trained on the MIT-BIH dataset to classify
                            ECG signals into 5 arrhythmia categories with 86.12% accuracy.
                            Now enhanced with LLM-powered cardiac intelligence.
                        </p>
                        <div className="hero-actions">
                            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('scanner')} id="hero-scan-btn">
                                <Activity size={20} />
                                Start ECG Scan
                                <ArrowRight size={18} />
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('assistant')} id="hero-ai-btn">
                                <Zap size={20} />
                                Ask CardioAI
                            </button>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <span className="hero-stat-value">86.12%</span>
                                <span className="hero-stat-label">Accuracy</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <span className="hero-stat-value">5</span>
                                <span className="hero-stat-label">Beat Classes</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <span className="hero-stat-value">2D CNN</span>
                                <span className="hero-stat-label">Architecture</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual animate-slide-right">
                        <div className="hero-ecg-wrapper">
                            <ECGChart signal={DEMO_SIGNAL} severity="normal" title="Sample ECG Waveform" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">Features</span>
                        <h2>Cutting-Edge <span className="text-gradient">Technology</span></h2>
                        <p>Combining deep learning with modern web technology for accessible cardiac analysis.</p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, idx) => (
                            <div
                                key={feature.title}
                                className="feature-card glass-card"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="feature-icon" style={{ background: `${feature.color}15`, color: feature.color }}>
                                    <feature.icon size={24} />
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Beat Types */}
            <section className="beat-types section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">Classification</span>
                        <h2>5 Beat <span className="text-gradient">Categories</span></h2>
                        <p>Our model identifies and classifies heartbeats across these categories.</p>
                    </div>

                    <div className="beat-types-grid">
                        {beatTypes.map((beat, idx) => (
                            <div
                                key={beat.name}
                                className="beat-card glass-card"
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                <div className={`beat-indicator badge badge-${beat.severity}`}>
                                    <beat.icon size={14} />
                                    {beat.severity}
                                </div>
                                <h3>{beat.name}</h3>
                                <p>{beat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="how-it-works section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">How It Works</span>
                        <h2>Simple <span className="text-gradient">Workflow</span></h2>
                        <p>Get your ECG analyzed in just a few simple steps.</p>
                    </div>

                    <div className="steps-grid">
                        {steps.map((step, idx) => (
                            <div
                                key={step.num}
                                className="step-card glass-card"
                                style={{ animationDelay: `${idx * 120}ms` }}
                            >
                                <span className="step-number text-gradient">{step.num}</span>
                                <div className="step-icon-wrapper">
                                    <step.icon size={24} />
                                </div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                                {idx < steps.length - 1 && (
                                    <div className="step-connector">
                                        <ChevronRight size={20} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta section">
                <div className="container">
                    <div className="cta-card glass-card">
                        <div className="cta-content">
                            <Heart size={48} className="cta-icon" />
                            <h2>Ready to Analyze Your ECG?</h2>
                            <p>Upload your ECG data and get instant AI-powered arrhythmia detection with detailed insights.</p>
                            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('scanner')}>
                                <Activity size={20} />
                                Launch ECG Scanner
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <Heart size={20} style={{ color: 'var(--accent-primary)' }} />
                            <span className="brand-text"><span className="text-gradient">Cardio</span>Scan</span>
                        </div>
                        <p className="footer-disclaimer">
                            This tool is for educational and research purposes only.
                            Always consult qualified healthcare professionals for medical decisions.
                        </p>
                        <p className="footer-copy">© 2026 CardioScan • Built with React & TensorFlow</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
