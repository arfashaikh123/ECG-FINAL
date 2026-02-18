import { useState, useRef, useEffect } from 'react';
import { Send, Zap, User, Loader2, Sparkles, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithAI } from '../services/api';
import './ChatPanel.css';

export default function ChatPanel({ analysisContext = null }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content:
                "Hello! I'm **HeartAI**, your intelligent ECG analysis assistant. 🫀\n\n" +
                "I can help you with:\n" +
                "- Understanding your ECG analysis results\n" +
                "- Explaining different types of arrhythmias\n" +
                "- General heart health information\n" +
                "- Interpreting cardiac rhythms\n\n" +
                "How can I assist you today?",
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const data = await chatWithAI(userMessage, analysisContext);
            setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `⚠️ ${err.message || 'Failed to get response. Please check if the backend is running and GEMINI_API_KEY is set.'}`,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: "Chat cleared. How can I help you with ECG analysis? 🫀",
            },
        ]);
    };

    const quickPrompts = [
        "What is atrial fibrillation?",
        "Explain normal sinus rhythm",
        "What causes ventricular ectopic beats?",
        "How to read an ECG?",
    ];

    return (
        <div className="chat-panel glass-card">
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-left">
                    <div className="chat-avatar">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h3>HeartAI Assistant</h3>
                        <span className="chat-status">
                            <span className="status-dot" /> Powered by Gemini
                        </span>
                    </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={clearChat} title="Clear chat">
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message chat-message-${msg.role}`}>
                        <div className="message-avatar">
                            {msg.role === 'assistant' ? <Zap size={16} /> : <User size={16} />}
                        </div>
                        <div className="message-content">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="chat-message chat-message-assistant">
                        <div className="message-avatar">
                            <Zap size={16} />
                        </div>
                        <div className="message-content message-loading">
                            <Loader2 size={16} className="spinner-icon" />
                            <span>Analyzing...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
                <div className="chat-quick-prompts">
                    {quickPrompts.map((prompt) => (
                        <button
                            key={prompt}
                            className="quick-prompt"
                            onClick={() => {
                                setInput(prompt);
                                inputRef.current?.focus();
                            }}
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="chat-input-wrapper">
                <textarea
                    ref={inputRef}
                    className="chat-input"
                    placeholder="Ask me about ECG, arrhythmias, or heart health..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={isLoading}
                    id="chat-input-field"
                />
                <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    id="chat-send-button"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
