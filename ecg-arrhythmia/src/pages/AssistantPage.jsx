import ChatPanel from '../components/ChatPanel';
import { Sparkles } from 'lucide-react';
import './AssistantPage.css';

export default function AssistantPage({ analysisContext }) {
    return (
        <div className="assistant-page">
            <div className="assistant-bg">
                <div className="assistant-grid" />
            </div>

            <div className="container">
                <div className="assistant-header animate-fade-in">
                    <div className="assistant-header-icon">
                        <Sparkles size={28} />
                    </div>
                    <h1><span className="text-gradient">CardioAI</span> Assistant</h1>
                    <p>
                        AI-powered cardiac intelligence — ask questions about ECG analysis,
                        arrhythmias, and heart health
                    </p>
                    {analysisContext && (
                        <div className="context-badge">
                            <span className="context-dot" />
                            Active analysis context: <strong>{analysisContext.beat_type}</strong> ({analysisContext.confidence}% confidence)
                        </div>
                    )}
                </div>

                <div className="assistant-chat-wrapper animate-fade-in">
                    <ChatPanel analysisContext={analysisContext} />
                </div>
            </div>
        </div>
    );
}
