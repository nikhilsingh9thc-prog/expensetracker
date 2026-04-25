import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../api/axios';

export default function ClassicAddExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultType = location.state?.type || 'expense';
  
  const [categories, setCategories] = useState([]);
  
  // Get local date string YYYY-MM-DD to avoid timezone offset issues
  const getLocalDateString = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const [form, setForm] = useState({
    type: defaultType,
    category: '',
    amount: '',
    date: getLocalDateString(),
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form type if user clicks different nav link while already on this page
  useEffect(() => {
    if (location.state?.type && location.state.type !== form.type) {
      setForm(prev => ({ ...prev, type: location.state.type, category: '' }));
    }
  }, [location.state?.type]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await API.get('/categories/', { params: { page_size: 100 } });
        setCategories(res.data.results || res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log("[DEBUG] Sending transaction form payload:", form);
      const res = await API.post('/transactions/', form);
      console.log("[DEBUG] API response:", res.data);
      navigate('/');
    } catch (err) {
      console.error("[DEBUG] API Error:", err);
      const errMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      setError(`Failed to add transaction: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === form.type);

  return (
    <div className="page-wrapper">
      <div className="classic-card">
        <h1 className="classic-title">Add New Transaction</h1>
        
        {error && <div style={{ color: 'var(--kb-expense)', marginBottom: '20px', fontSize: '1.15rem', fontWeight: '500' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
        <div className="classic-form-group">
          <label className="classic-label">Type</label>
          <div className="classic-radio-group">
            <label className="classic-radio-label">
              <input 
                type="radio" 
                name="type" 
                value="expense" 
                checked={form.type === 'expense'} 
                onChange={() => setForm({ ...form, type: 'expense', category: '' })} 
              /> Expense
            </label>
            <label className="classic-radio-label">
              <input 
                type="radio" 
                name="type" 
                value="income" 
                checked={form.type === 'income'} 
                onChange={() => setForm({ ...form, type: 'income', category: '' })}
              /> Income
            </label>
          </div>
        </div>

        <div className="classic-form-group">
          <label className="classic-label">Amount</label>
          <input 
            type="number" 
            step="0.01" 
            required 
            className="classic-input"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="e.g. 100"
          />
        </div>

        <div className="classic-form-group">
          <label className="classic-label">Category</label>
          <select 
            required 
            className="classic-input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select a Category</option>
            {filteredCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="classic-form-group">
          <label className="classic-label">Date</label>
          <input 
            type="date" 
            required 
            className="classic-input"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        <div className="classic-form-group">
          <label className="classic-label">Note / Description</label>
          <input 
            type="text" 
            className="classic-input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What was this for?"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="classic-btn classic-btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '1.25rem', marginTop: '10px' }}>
          {loading ? 'Saving...' : 'Save Transaction'}
        </button>
      </form>
      </div>
      <div style={{ height: '80px' }}></div>
    </div>
  );
}
