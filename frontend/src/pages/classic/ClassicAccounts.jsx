import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

export default function ClassicAccounts() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', type: 'expense', icon: '📁' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories/');
      setCategories(res.data.results || (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await API.post('/categories/', form);
      setForm({ name: '', type: 'expense', icon: '📁' });
      fetchCategories();
    } catch (err) {
      alert('Failed to create account/category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account/category?')) return;
    try {
      await API.delete(`/categories/${id}/`);
      fetchCategories();
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div className="page-wrapper" style={{ padding: '20px' }}>
      <h1 className="classic-title">Accounts / Categories</h1>
      
      <form onSubmit={handleCreate} style={{
        background: 'var(--kb-bg)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: 'var(--kb-shadow)',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--kb-text)', marginBottom: '15px' }}>Add New Account</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <select 
            className="classic-input" 
            value={form.type} 
            onChange={e => setForm({...form, type: e.target.value})}
            style={{ width: 'auto' }}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input 
            className="classic-input" 
            placeholder="Account Name (e.g. Bank, Food)" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})}
            required
            style={{ flex: 1 }}
          />
        </div>
        <button type="submit" className="classic-btn classic-btn-primary" style={{ width: '100%', padding: '12px' }}>Create Account</button>
      </form>

      <div style={{
        background: 'var(--kb-bg)',
        borderRadius: '12px',
        boxShadow: 'var(--kb-shadow)',
        overflow: 'hidden'
      }}>
        {categories.map(cat => (
          <div key={cat.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '15px 20px', borderBottom: '1px solid var(--kb-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
              <div>
                <div style={{ color: 'var(--kb-text)', fontWeight: 'bold' }}>{cat.name}</div>
                <div style={{ color: 'var(--kb-text-light)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{cat.type}</div>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(cat.id)}
              className="classic-btn"
              style={{ color: 'var(--kb-expense)', padding: '5px 10px', fontSize: '0.9rem' }}>
              Delete
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--kb-text-light)' }}>No accounts created.</div>
        )}
      </div>

      <div style={{ height: '80px' }}></div>
    </div>
  );
}
