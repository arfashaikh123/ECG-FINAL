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
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import ECGChart from './ECGChart';
import { explainPrediction } from '../services/api';
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
    const [explanationText, setExplanationText] = useState(null);
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
            if (data.explanation_text) {
                setExplanationText(data.explanation_text);
            }
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
            const element = document.querySelector('.result-card');
            if (!element) return;

            // Create PDF
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            let y = 20;

            // Helper to check page break
            const checkPageBreak = (heightNeeded) => {
                if (y + heightNeeded > pageHeight - margin) {
                    doc.addPage();
                    y = 20; // Reset Y
                }
            };

            // Title
            doc.setFontSize(22);
            doc.setTextColor(30, 41, 59);
            doc.text("HeartAI Analysis Report", margin, y);
            y += 8;

            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
            y += 15;

            // Summary
            doc.setFontSize(14);
            doc.setTextColor(30, 41, 59);
            doc.text("Diagnosis Summary", margin, y);
            y += 8;

            doc.setFontSize(11);
            doc.setTextColor(71, 85, 105);
            doc.text(`Condition: ${result.beat_type}`, margin, y);
            doc.text(`Severity: ${result.severity.toUpperCase()}`, 120, y);
            y += 6;
            doc.text(`Confidence: ${result.confidence}%`, margin, y);
            doc.text(`Signal Quality: ${result.sqi_quality || 'N/A'}`, 120, y);
            y += 15;

            // Chart
            const chartEl = document.querySelector('.recharts-wrapper');
            if (chartEl) {
                doc.setFontSize(14);
                doc.setTextColor(30, 41, 59);
                doc.text("ECG Waveform Analysis", margin, y);
                y += 6;

                const canvas = await html2canvas(chartEl, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false
                });
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - (margin * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                checkPageBreak(imgHeight + 10);
                doc.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
                y += imgHeight + 15;
            }

            // Standard Description
            checkPageBreak(30);
            doc.setFontSize(14);
            doc.setTextColor(30, 41, 59);
            doc.text("Clinical Interpretation", margin, y);
            y += 8;

            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85);
            const splitText = doc.splitTextToSize(result.description || "No details available.", pageWidth - (margin * 2));

            // Render line by line to check for page breaks
            splitText.forEach(line => {
                checkPageBreak(5);
                doc.text(line, margin, y);
                y += 5;
            });
            y += 10;

            // AI Explanation (The long part)
            if (explanationText) {
                checkPageBreak(30);
                doc.setFontSize(14);
                doc.setTextColor(30, 41, 59);
                doc.text("AI Detailed Analysis", margin, y);
                y += 8;

                doc.setFontSize(10);
                doc.setTextColor(51, 65, 85);

                // Process text to handle newlines and bullet points
                const paragraphs = explanationText.split('\n');

                paragraphs.forEach(para => {
                    const cleanPara = para.trim();
                    if (!cleanPara) {
                        y += 3; // minimal spacing for empty lines
                        return;
                    }

                    const lines = doc.splitTextToSize(cleanPara, pageWidth - (margin * 2));

                    lines.forEach(line => {
                        checkPageBreak(5);
                        doc.text(line, margin, y);
                        y += 5;
                    });
                    y += 2; // Extra paragraph spacing
                });
            }

            // Footer
            checkPageBreak(20);
            y = Math.max(y, pageHeight - 20); // Push to bottom if space permits, else new page
            if (y > pageHeight - 20) {
                doc.addPage();
                y = pageHeight - 20;
            }

            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text("DISCLAIMER: This report is generated by AI (HeartAI) for educational purposes only.", margin, y);
            doc.text("Consult a healthcare professional for medical diagnosis.", margin, y + 5);

            doc.save(`heartai_report_${Date.now()}.pdf`);

        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Failed to generate PDF. Make sure all assets are loaded.");
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

            {/* Detailed Explanation Text */}
            {explanationText && (
                <div className="result-explanation glass-card animate-fade-in" style={{ margin: '1rem 0', padding: '1rem', borderLeft: '4px solid #8b5cf6' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Brain size={16} color="#8b5cf6" />
                        AI Analysis
                    </h4>
                    <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                        {explanationText}
                    </div>
                </div>
            )}

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
                    This analysis is for informational purposes only. The model accuracy is approximately 99.20%.
                    Always consult a qualified healthcare professional for medical decisions.
                </span>
            </div>
        </div>
    );
}
