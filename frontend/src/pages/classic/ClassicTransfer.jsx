import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

export default function ClassicTransfer() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fromCategory: '',
    toCategory: '',
    amount: '',
    description: 'Transfer',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories/');
        setCategories(res.data.results || (Array.isArray(res.data) ? res.data : []));
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!form.fromCategory || !form.toCategory || !form.amount) return;
    if (form.fromCategory === form.toCategory) {
      setError("Cannot transfer to the same account.");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 1. Create Expense
      await API.post('/transactions/', {
        type: 'expense',
        category: form.fromCategory,
        amount: form.amount,
        date: form.date,
        description: `Transfer out: ${form.description}`
      });
      
      // 2. Create Income
      await API.post('/transactions/', {
        type: 'income',
        category: form.toCategory,
        amount: form.amount,
        date: form.date,
        description: `Transfer in: ${form.description}`
      });
      
      navigate('/');
    } catch (err) {
      setError('Transfer failed. Please check your inputs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ padding: '20px' }}>
      <h1 className="classic-title">Transfer Money</h1>
      
      <form onSubmit={handleTransfer} style={{
        background: 'var(--kb-bg)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: 'var(--kb-shadow)'
      }}>
        {error && <div style={{ color: 'var(--kb-expense)', marginBottom: '15px' }}>{error}</div>}

        <div className="classic-form-group">
          <label className="classic-label">From Account (Category)</label>
          <select 
            required 
            className="classic-input"
            value={form.fromCategory}
            onChange={e => setForm({...form, fromCategory: e.target.value})}
          >
            <option value="">Select source...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="classic-form-group">
          <label className="classic-label">To Account (Category)</label>
          <select 
            required 
            className="classic-input"
            value={form.toCategory}
            onChange={e => setForm({...form, toCategory: e.target.value})}
          >
            <option value="">Select destination...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="classic-form-group">
          <label className="classic-label">Amount</label>
          <input 
            type="number" step="0.01" required 
            className="classic-input"
            value={form.amount}
            onChange={e => setForm({...form, amount: e.target.value})}
          />
        </div>

        <div className="classic-form-group">
          <label className="classic-label">Date</label>
          <input 
            type="date" required 
            className="classic-input"
            value={form.date}
            onChange={e => setForm({...form, date: e.target.value})}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="classic-btn classic-btn-primary" 
          style={{ width: '100%', padding: '15px', fontSize: '1.1rem', marginTop: '10px' }}>
          {loading ? 'Processing...' : 'Complete Transfer'}
        </button>
      </form>
      <div style={{ height: '80px' }}></div>
    </div>
  );
}
