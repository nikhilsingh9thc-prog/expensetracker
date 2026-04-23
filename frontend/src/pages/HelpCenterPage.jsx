import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function HelpCenterPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [reportForm, setReportForm] = useState({ subject: '', description: '', category: 'bug', priority: 'medium' });
  const [submitStatus, setSubmitStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Local FAQ data (works without backend)
  const faqs = [
    { id: 1, question: t('faqQ1') || 'How do I add a transaction?', answer: t('faqA1') || 'Go to the Transactions page, click "+ Add Transaction", fill in the details (type, category, amount, date), and save.', category: 'transactions' },
    { id: 2, question: t('faqQ2') || 'How do I set a budget?', answer: t('faqA2') || 'Navigate to the Budgets page, click "+ Set Budget", choose an expense category, set your monthly limit, and save. You\'ll see progress bars showing your spending.', category: 'budgets' },
    { id: 3, question: t('faqQ3') || 'How can I export my transactions?', answer: t('faqA3') || 'On the Transactions page, click the "📥 Export CSV" button. Your current filtered transactions will download as a CSV file.', category: 'transactions' },
    { id: 4, question: t('faqQ4') || 'How do I change the app language?', answer: t('faqA4') || 'Look at the bottom of the sidebar for the Language dropdown. Select your preferred language and the app updates instantly.', category: 'general' },
    { id: 5, question: t('faqQ5') || 'How do I change the currency?', answer: t('faqA5') || 'In the sidebar, find the Currency dropdown. Choose your preferred currency (INR, USD, EUR, GBP, JPY).', category: 'general' },
    { id: 6, question: t('faqQ6') || 'Is my financial data secure?', answer: t('faqA6') || 'Yes! We use JWT authentication, encrypted passwords, and secure API connections. Your data is never shared with third parties.', category: 'security' },
    { id: 7, question: t('faqQ7') || 'How do I reset my password?', answer: t('faqA7') || 'Go to your Profile page and use the "Change Password" section. Enter your current password and set a new one.', category: 'account' },
    { id: 8, question: t('faqQ8') || 'Can I view monthly spending reports?', answer: t('faqA8') || 'Yes! Go to the Reports page to see monthly expense breakdowns, income vs expenses charts, spending trends, and yearly summaries.', category: 'reports' },
    { id: 9, question: t('faqQ9') || 'What happens when I exceed my budget?', answer: t('faqA9') || 'You\'ll see a warning alert on both the Dashboard and the Budgets page. The progress bar turns red to indicate you\'ve exceeded your limit.', category: 'budgets' },
    { id: 10, question: t('faqQ10') || 'How do I contact support?', answer: t('faqA10') || 'Use the "Report Issue" tab in this Help Center. Submit a ticket describing your issue and our team will respond via the ticket chat.', category: 'general' },
  ];

  const filteredFaqs = faqs.filter(
    (faq) => faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
             faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  // Fetch tickets
  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/helpdesk/tickets/');
      setTickets(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    }
  };

  const fetchTicketDetail = async (id) => {
    try {
      const res = await API.get(`/helpdesk/tickets/${id}/`);
      setTicketDetail(res.data);
      setSelectedTicket(id);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error('Failed to fetch ticket', err);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus('');
    try {
      await API.post('/helpdesk/tickets/', reportForm);
      setSubmitStatus('success');
      setReportForm({ subject: '', description: '', category: 'bug', priority: 'medium' });
      setTimeout(() => { setActiveTab('tickets'); setSubmitStatus(''); }, 1500);
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;
    try {
      await API.post(`/helpdesk/tickets/${selectedTicket}/messages/`, { message: newMessage });
      setNewMessage('');
      fetchTicketDetail(selectedTicket);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = () => {
    if (!user) return '?';
    return (user.first_name?.[0] || user.username?.[0] || '?').toUpperCase();
  };

  const statusLabels = { open: t('statusOpen') || 'Open', in_progress: t('statusInProgress') || 'In Progress', resolved: t('statusResolved') || 'Resolved', closed: t('statusClosed') || 'Closed' };
  const categoryLabels = { bug: '🐛 Bug Report', feature: '✨ Feature Request', account: '👤 Account Issue', payment: '💳 Payment Issue', other: '📋 Other' };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">❓ {t('helpCenter')}</h1>
          <p className="page-description">{t('helpCenterDesc')}</p>
        </div>
      </div>

      <div className="help-tabs">
        <button className={`help-tab ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => { setActiveTab('faq'); setSelectedTicket(null); }} id="help-tab-faq">
          📚 {t('faqTab')}
        </button>
        <button className={`help-tab ${activeTab === 'report' ? 'active' : ''}`} onClick={() => { setActiveTab('report'); setSelectedTicket(null); }} id="help-tab-report">
          🐛 {t('reportIssueTab')}
        </button>
        <button className={`help-tab ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => { setActiveTab('tickets'); setSelectedTicket(null); }} id="help-tab-tickets">
          📋 {t('myTicketsTab')}
        </button>
      </div>

      {/* ── FAQ TAB ── */}
      {activeTab === 'faq' && (
        <div className="slide-up">
          <div className="faq-search">
            <input
              className="form-input"
              type="text"
              placeholder={t('searchFaq') || '🔍 Search FAQs...'}
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              id="faq-search-input"
            />
          </div>
          <div className="faq-list">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className={`faq-item ${openFaq === faq.id ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}>
                  <span>{faq.question}</span>
                  <span className="faq-chevron">▼</span>
                </button>
                {openFaq === faq.id && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <div className="empty-state-title">{t('noResults') || 'No results found'}</div>
                <div className="empty-state-text">{t('tryDifferentSearch') || 'Try a different search term'}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── REPORT ISSUE TAB ── */}
      {activeTab === 'report' && (
        <div className="card slide-up">
          <h3 className="card-title" style={{ marginBottom: 20 }}>🐛 {t('reportNewIssue') || 'Report a New Issue'}</h3>
          {submitStatus === 'success' && <div className="profile-success">✅ {t('ticketSubmitted') || 'Ticket submitted successfully! Redirecting...'}</div>}
          {submitStatus === 'error' && <div className="auth-error">❌ {t('ticketFailed') || 'Failed to submit ticket. Please try again.'}</div>}
          <form onSubmit={handleSubmitTicket} className="report-form">
            <div className="form-group">
              <label className="form-label" htmlFor="ticket-subject">{t('subject') || 'Subject'}</label>
              <input id="ticket-subject" className="form-input" type="text" placeholder={t('ticketSubjectPlaceholder') || 'Brief description of the issue'} value={reportForm.subject} onChange={(e) => setReportForm({ ...reportForm, subject: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="ticket-category">{t('category') || 'Category'}</label>
                <select id="ticket-category" className="form-select" value={reportForm.category} onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}>
                  <option value="bug">🐛 Bug Report</option>
                  <option value="feature">✨ Feature Request</option>
                  <option value="account">👤 Account Issue</option>
                  <option value="payment">💳 Payment Issue</option>
                  <option value="other">📋 Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ticket-priority">{t('priority') || 'Priority'}</label>
                <select id="ticket-priority" className="form-select" value={reportForm.priority} onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ticket-description">{t('description') || 'Description'}</label>
              <textarea id="ticket-description" className="form-input" rows="5" placeholder={t('ticketDescPlaceholder') || 'Describe the issue in detail. Include steps to reproduce if applicable.'} value={reportForm.description} onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })} required style={{ resize: 'vertical', minHeight: 120 }} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="submit-ticket-btn">
              {loading ? (t('submitting') || 'Submitting...') : (t('submitTicket') || '📨 Submit Ticket')}
            </button>
          </form>
        </div>
      )}

      {/* ── MY TICKETS TAB ── */}
      {activeTab === 'tickets' && !selectedTicket && (
        <div className="slide-up">
          {tickets.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-title">{t('noTickets') || 'No tickets yet'}</div>
                <div className="empty-state-text">{t('noTicketsDesc') || "You haven't submitted any support tickets."}</div>
                <button className="btn btn-primary" onClick={() => setActiveTab('report')}>
                  🐛 {t('reportIssueTab') || 'Report Issue'}
                </button>
              </div>
            </div>
          ) : (
            <div className="tickets-list">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-card" onClick={() => fetchTicketDetail(ticket.id)}>
                  <span className="ticket-id">#{ticket.id}</span>
                  <div className="ticket-info">
                    <div className="ticket-subject">{ticket.subject}</div>
                    <div className="ticket-meta">
                      <span>{categoryLabels[ticket.category] || ticket.category}</span>
                      <span>•</span>
                      <span>{formatDate(ticket.created_at)}</span>
                    </div>
                  </div>
                  <span className={`ticket-status ${ticket.status}`}>{statusLabels[ticket.status] || ticket.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TICKET CHAT VIEW ── */}
      {activeTab === 'tickets' && selectedTicket && ticketDetail && (
        <div className="card slide-up">
          <div className="ticket-chat">
            <div className="ticket-chat-header">
              <button className="ticket-chat-back" onClick={() => { setSelectedTicket(null); setTicketDetail(null); }}>
                ← {t('backToTickets') || 'Back'}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>#{ticketDetail.id} — {ticketDetail.subject}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {categoryLabels[ticketDetail.category]} • {statusLabels[ticketDetail.status]}
                </div>
              </div>
              <span className={`ticket-status ${ticketDetail.status}`}>{statusLabels[ticketDetail.status]}</span>
            </div>

            <div className="chat-messages">
              {ticketDetail.messages?.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.sender_type}`}>
                  <div className="chat-avatar">
                    {msg.sender_type === 'user' ? getInitials() : '🛟'}
                  </div>
                  <div>
                    <div className="chat-bubble">{msg.message}</div>
                    <div className="chat-time">{formatDate(msg.created_at)}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-bar">
              <input
                className="form-input"
                type="text"
                placeholder={t('typeMessage') || 'Type your message...'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                id="ticket-chat-input"
              />
              <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()} id="ticket-send-btn">
                {t('send') || 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
