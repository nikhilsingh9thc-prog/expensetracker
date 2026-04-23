import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getAIResponse } from '../data/aiResponses';

export default function AIAssistantPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickActions = [
    { icon: '💰', text: 'How can I save more money?', query: 'How can I save more money?' },
    { icon: '🎯', text: 'Help me set up a budget', query: 'How to set budget' },
    { icon: '📊', text: 'Show me platform features', query: 'What features does this app have?' },
    { icon: '📈', text: 'Investment guidance', query: 'Where should I invest?' },
    { icon: '✂️', text: 'Tips to reduce expenses', query: 'How to reduce expenses' },
    { icon: '🛡️', text: 'Build an emergency fund', query: 'How to build emergency fund' },
  ];

  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      time: formatTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));

    const aiResponse = getAIResponse(text);

    const aiMsg = {
      id: Date.now() + 1,
      type: 'assistant',
      text: aiResponse,
      time: formatTime(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (query) => {
    sendMessage(query);
  };

  const getInitials = () => {
    if (!user) return '?';
    const first = user.first_name?.[0] || user.username?.[0] || '?';
    return first.toUpperCase();
  };

  // Simple markdown-like rendering
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (line.startsWith('• ')) {
        return <div key={i} style={{ paddingLeft: 8, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: line }} />;
      }
      // Numbered lists
      if (/^\d+\./.test(line)) {
        return <div key={i} style={{ paddingLeft: 8, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: line }} />;
      }
      if (line === '') return <br key={i} />;
      return <div key={i} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🤖 {t('aiAssistant')}</h1>
          <p className="page-description">{t('aiAssistantDesc')}</p>
        </div>
      </div>

      <div className="card">
        <div className="ai-chat-container">
          {messages.length === 0 ? (
            <div className="ai-welcome">
              <div className="ai-welcome-icon">🤖</div>
              <h2 className="ai-welcome-title">{t('aiWelcomeTitle')}</h2>
              <p className="ai-welcome-subtitle">{t('aiWelcomeSubtitle')}</p>
              <div className="ai-quick-actions">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    className="ai-quick-btn"
                    onClick={() => handleQuickAction(action.query)}
                  >
                    <div className="ai-quick-btn-icon">{action.icon}</div>
                    <div className="ai-quick-btn-text">{action.text}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="ai-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`ai-message ${msg.type}`}>
                  <div className="ai-msg-avatar">
                    {msg.type === 'user' ? getInitials() : '🤖'}
                  </div>
                  <div className="ai-msg-content">
                    <div className="ai-msg-bubble">{renderText(msg.text)}</div>
                    <span className="ai-msg-time">{msg.time}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="ai-typing">
                  <div className="ai-msg-avatar" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    🤖
                  </div>
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="ai-input-bar">
            <input
              ref={inputRef}
              className="form-input"
              type="text"
              placeholder={t('aiInputPlaceholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              id="ai-chat-input"
            />
            <button
              type="submit"
              className="ai-send-btn"
              disabled={!input.trim() || isTyping}
              id="ai-send-button"
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
