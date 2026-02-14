import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Area,
    AreaChart,
} from 'recharts';
import './ECGChart.css';

export default function ECGChart({ signal, severity = 'normal', title = 'ECG Signal', minimal = false }) {
    const data = useMemo(() => {
        if (!signal || signal.length === 0) return [];
        return signal.map((val, idx) => ({
            time: idx,
            value: val,
        }));
    }, [signal]);

    const getColor = () => {
        switch (severity) {
            case 'danger': return '#ef476f';
            case 'warning': return '#ffd166';
            case 'caution': return '#ffd166';
            case 'unknown': return '#8b5cf6';
            default: return '#06d6a0';
        }
    };

    const color = getColor();

    if (minimal) {
        return (
            <div className="ecg-chart-minimal">
                <ResponsiveContainer width="100%" height={80}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`grad-${severity}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            fill={`url(#grad-${severity})`}
                            strokeWidth={1.5}
                            dot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return (
        <div className="ecg-chart glass-card">
            <div className="ecg-chart-header">
                <div className="ecg-chart-title">
                    <div className="ecg-dot" style={{ background: color }} />
                    <h3>{title}</h3>
                </div>
                <div className="ecg-chart-info">
                    <span className="ecg-sample-count">{signal?.length || 0} samples</span>
                </div>
            </div>

            <div className="ecg-chart-body">
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="ecgGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                                <stop offset="50%" stopColor={color} stopOpacity={1} />
                                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(148, 163, 184, 0.08)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="time"
                            stroke="var(--text-muted)"
                            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                            label={{ value: 'Sample Index', position: 'insideBottom', offset: -2, style: { fill: 'var(--text-muted)', fontSize: 11 } }}
                        />
                        <YAxis
                            stroke="var(--text-muted)"
                            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                            label={{ value: 'Amplitude', angle: -90, position: 'insideLeft', offset: 15, style: { fill: 'var(--text-muted)', fontSize: 11 } }}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(17, 24, 39, 0.95)',
                                border: `1px solid ${color}33`,
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-lg)',
                                color: 'var(--text-primary)',
                                fontSize: '0.85rem',
                            }}
                            labelFormatter={(val) => `Sample: ${val}`}
                            formatter={(val) => [val.toFixed(4), 'Amplitude']}
                        />
                        <ReferenceLine
                            y={data.length > 0 ? data.reduce((acc, d) => acc + d.value, 0) / data.length : 0}
                            stroke={color}
                            strokeDasharray="8 4"
                            strokeOpacity={0.3}
                            label={{ value: 'Mean', position: 'right', style: { fill: 'var(--text-muted)', fontSize: 10 } }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="url(#ecgGradient)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 5,
                                fill: color,
                                stroke: '#fff',
                                strokeWidth: 2,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Scanline effect */}
            <div className="ecg-scanline" style={{ background: `linear-gradient(90deg, transparent, ${color}22, transparent)` }} />
        </div>
    );
}
