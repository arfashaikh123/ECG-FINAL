import { useState } from 'react';
import {
    Heart,
    AlertTriangle,
    AlertOctagon,
    Shuffle,
    HelpCircle,
    Shield,
    TrendingUp,
    FileText,
    Brain,
    Loader2,
    Activity,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import ECGChart from './ECGChart';
import { generateReport, explainPrediction } from '../services/api';
import './ResultCard.css';

const SEVERITY_CONFIG = {
    normal: {
        icon: Shield,
        color: '#06d6a0',
        label: 'Normal',
        bgClass: 'result-normal',
    },
    warning: {
        icon: AlertTriangle,
        color: '#ffd166',
        label: 'Arrhythmia Detected',
        bgClass: 'result-warning',
    },
    danger: {
        icon: AlertOctagon,
        color: '#ef476f',
        label: 'Arrhythmia Detected',
        bgClass: 'result-danger',
    },
    caution: {
        icon: Shuffle,
        color: '#ffd166',
        label: 'Attention Required',
        bgClass: 'result-caution',
    },
    unknown: {
        icon: HelpCircle,
        color: '#8b5cf6',
        label: 'Further Analysis Needed',
        bgClass: 'result-unknown',
    },
};

const PIE_COLORS = ['#06d6a0', '#ffd166', '#ef476f', '#ff9f43', '#8b5cf6'];

export default function ResultCard({ result }) {
    const [heatmap, setHeatmap] = useState(null);
    const [isExplaining, setIsExplaining] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!result) return null;

    const config = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.unknown;
    const Icon = config.icon;

    const pieData = result.probabilities
        ? Object.entries(result.probabilities).map(([name, value]) => ({
            name,
            value,
        }))
        : [];

    const handleExplain = async () => {
        try {
            setIsExplaining(true);
            const data = await explainPrediction(result.signal, result.label);
            setHeatmap(data.heatmap);
        } catch (error) {
            console.error("Explanation failed:", error);
            alert("Failed to generate AI explanation.");
        } finally {
            setIsExplaining(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            setIsDownloading(true);
            const blob = await generateReport(result);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cardioscan_report_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download report.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className={`result-card animate-fade-in ${config.bgClass}`}>
            {/* Header */}
            <div className="result-header">
                <div className="result-status">
                    <div className="result-icon-wrapper" style={{ background: `${config.color}15`, borderColor: `${config.color}30` }}>
                        <Icon size={28} style={{ color: config.color }} />
                    </div>
                    <div>
                        <span className={`badge badge-${result.severity}`}>{config.label}</span>
                        <h2 className="result-beat-type">{result.beat_type}</h2>
                    </div>
                </div>
                <div className="result-confidence">
                    <div className="confidence-ring" style={{ '--progress': `${result.confidence}%`, '--color': config.color }}>
                        <span className="confidence-value">{result.confidence}%</span>
                    </div>
                    <span className="confidence-label">Confidence</span>
                </div>
            </div>

            {/* Actions for Advanced Features */}
            <div className="result-actions">
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleExplain}
                    disabled={isExplaining || heatmap}
                >
                    {isExplaining ? <Loader2 size={16} className="spin" /> : <Brain size={16} />}
                    {heatmap ? 'Explanation Active' : 'Explain Prediction (AI)'}
                </button>
                <button
                    className="btn btn-outline btn-sm"
                    onClick={handleDownloadReport}
                    disabled={isDownloading}
                >
                    {isDownloading ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
                    Download Medical Report
                </button>
            </div>

            {/* ECG Signal */}
            {result.signal && (
                <ECGChart
                    signal={result.signal}
                    heatmap={heatmap}
                    severity={result.severity}
                    title="Analyzed ECG Signal"
                />
            )}

            {/* Stats Row */}
            <div className="result-stats">
                <div className="result-stat glass-card">
                    <Heart size={18} style={{ color: config.color }} />
                    <div>
                        <span className="stat-value">{result.beat_type}</span>
                        <span className="stat-label">Beat Classification</span>
                    </div>
                </div>
                <div className="result-stat glass-card">
                    <Activity size={18} style={{ color: result.sqi_quality === 'Poor' ? '#ef4444' : '#10b981' }} />
                    <div>
                        <span className="stat-value">{result.sqi_quality || 'N/A'}</span>
                        <span className="stat-label">Signal Quality (SQI)</span>
                    </div>
                </div>
                <div className="result-stat glass-card">
                    <TrendingUp size={18} style={{ color: '#118ab2' }} />
                    <div>
                        <span className="stat-value">{result.model_accuracy}%</span>
                        <span className="stat-label">Model Accuracy</span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="result-description glass-card">
                <h3>Classification Details</h3>
                <p>{result.description}</p>
            </div>

            {/* Probability Distribution */}
            {pieData.length > 0 && (
                <div className="result-probabilities glass-card">
                    <h3>Probability Distribution</h3>
                    <div className="prob-content">
                        <div className="prob-chart">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(17, 24, 39, 0.95)',
                                            border: '1px solid rgba(148, 163, 184, 0.1)',
                                            borderRadius: 'var(--radius-md)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.8rem',
                                        }}
                                        formatter={(val) => [`${val.toFixed(2)}%`, 'Probability']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="prob-list">
                            {pieData.map((item, idx) => (
                                <div key={item.name} className="prob-item">
                                    <div className="prob-color" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                    <span className="prob-name">{item.name}</span>
                                    <span className="prob-value" style={{ color: PIE_COLORS[idx % PIE_COLORS.length] }}>
                                        {item.value.toFixed(2)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Disclaimer */}
            <div className="result-disclaimer">
                <AlertTriangle size={14} />
                <span>
                    This analysis is for informational purposes only. The model accuracy is approximately {result.model_accuracy}%.
                    Always consult a qualified healthcare professional for medical decisions.
                </span>
            </div>
        </div>
    );
}
