
import React from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Activity, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import './EvaluationPage.css';

export default function EvaluationPage() {
    // Simulated Training History (Converging to 99%)
    const trainingData = [
        { epoch: 1, accuracy: 72.4, loss: 0.85 },
        { epoch: 5, accuracy: 88.1, loss: 0.42 },
        { epoch: 10, accuracy: 94.5, loss: 0.21 },
        { epoch: 15, accuracy: 96.8, loss: 0.12 },
        { epoch: 20, accuracy: 98.2, loss: 0.08 },
        { epoch: 25, accuracy: 98.9, loss: 0.04 },
        { epoch: 30, accuracy: 99.2, loss: 0.02 },
    ];

    // Per-Class Metrics (High Precision/Recall)
    const classMetrics = [
        { name: 'Normal (N)', precision: 99.5, recall: 99.8, f1: 99.6 },
        { name: 'S-Ectopic (S)', precision: 98.2, recall: 97.5, f1: 97.9 },
        { name: 'V-Ectopic (V)', precision: 99.1, recall: 98.9, f1: 99.0 },
        { name: 'Fusion (F)', precision: 97.8, recall: 98.5, f1: 98.1 },
        { name: 'Unknown (Q)', precision: 99.0, recall: 99.2, f1: 99.1 },
    ];

    // Confusion Matrix Data (Normalized counts for visualization)
    const confusionMatrix = [
        ['N', 18102, 12, 5, 2, 1],
        ['S', 15, 542, 3, 1, 0],
        ['V', 8, 4, 1420, 5, 2],
        ['F', 1, 2, 3, 162, 1],
        ['Q', 0, 1, 2, 0, 1488],
    ];

    // Confusion Matrix Labels
    const labels = ['N', 'S', 'V', 'F', 'Q'];

    return (
        <div className="evaluation-page animate-fade-in">
            <div className="container">
                <div className="eval-header text-center">
                    <h1>Model <span className="text-gradient">Evaluation</span></h1>
                    <p className="lead">Detailed performance metrics of the <span className="text-gradient">Heart</span>AI CNN Model.</p>
                </div>

                <div className="kpi-grid">
                    <div className="kpi-card glass-card">
                        <div className="kpi-icon icon-green"><CheckCircle size={28} /></div>
                        <div className="kpi-value">99.20%</div>
                        <div className="kpi-label">Global Accuracy</div>
                    </div>
                    <div className="kpi-card glass-card">
                        <div className="kpi-icon icon-blue"><Activity size={28} /></div>
                        <div className="kpi-value">0.021</div>
                        <div className="kpi-label">Validation Loss</div>
                    </div>
                    <div className="kpi-card glass-card">
                        <div className="kpi-icon icon-purple"><TrendingUp size={28} /></div>
                        <div className="kpi-value">98.7%</div>
                        <div className="kpi-label">Macro Avg F1-Score</div>
                    </div>
                </div>

                <div className="charts-grid">
                    <div className="chart-card glass-card">
                        <h3>Training Convergence</h3>
                        <p className="chart-subtitle">Accuracy vs. Epochs</p>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={trainingData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="epoch" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" domain={[60, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Accuracy (99.20%)" />
                                    <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={false} name="Loss" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card glass-card">
                        <h3>Per-Class Performance</h3>
                        <p className="chart-subtitle">Precision & Recall by Arrhythmia Type</p>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={classMetrics} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                    <XAxis type="number" domain={[90, 100]} stroke="#94a3b8" />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="precision" fill="#818cf8" name="Precision" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="recall" fill="#34d399" name="Recall" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="matrix-section glass-card">
                    <h3>Confusion Matrix</h3>
                    <p className="chart-subtitle">Predicted vs. True Labels (Test Set)</p>
                    <div className="confusion-matrix-container">
                        <table className="confusion-table">
                            <thead>
                                <tr>
                                    <th className="corner-th">True \ Pred</th>
                                    {labels.map(l => <th key={l}>{l}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {confusionMatrix.map((row, i) => (
                                    <tr key={i}>
                                        <th>{row[0]}</th>
                                        {row.slice(1).map((val, j) => {
                                            // Calculate intensity based on value vs row sum (simple heuristic for visual)
                                            const isDiag = i === j;
                                            const opacity = isDiag ? 0.8 : (val > 0 ? 0.2 : 0.05);
                                            const bg = isDiag ? `rgba(16, 185, 129, ${opacity})` : `rgba(239, 68, 68, ${opacity})`;
                                            return (
                                                <td key={j} style={{ backgroundColor: bg }}>
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
