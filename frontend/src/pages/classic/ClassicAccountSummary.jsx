import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

export default function ClassicAccountSummary() {
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreakdown = async () => {
      try {
        const timestamp = new Date().getTime();
        const res = await API.get('/analytics/category-breakdown/', { params: { _t: timestamp } });
        setBreakdown(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBreakdown();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div className="page-wrapper" style={{ padding: '20px' }}>
      <h1 className="classic-title">Account Summary</h1>
      
      <div style={{
        background: 'var(--kb-bg)',
        borderRadius: '12px',
        boxShadow: 'var(--kb-shadow)',
        overflow: 'hidden'
      }}>
        {breakdown.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--kb-text-light)' }}>
            No transaction data available for accounts.
          </div>
        ) : (
          breakdown.map((item, index) => (
            <div key={index} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '15px 20px', borderBottom: '1px solid var(--kb-surface)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '1.5rem' }}>{item.category_icon || '📁'}</span>
                <div>
                  <div style={{ color: 'var(--kb-text)', fontWeight: 'bold' }}>{item.category_name}</div>
                  <div style={{ color: 'var(--kb-text-light)', fontSize: '0.85rem' }}>{item.count} Transactions</div>
                </div>
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--kb-expense)' }}>
                -₹{item.total.toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
      <div style={{ height: '80px' }}></div>
    </div>
  );
}
