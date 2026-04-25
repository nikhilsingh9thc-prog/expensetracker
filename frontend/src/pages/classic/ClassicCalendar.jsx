import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

export default function ClassicCalendar() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const timestamp = new Date().getTime();
        const res = await API.get('/transactions/', { params: { page_size: 200, _t: timestamp } });
        setTransactions(res.data.results || (Array.isArray(res.data) ? res.data : []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const renderDays = () => {
    let days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTxs = transactions.filter(tx => tx.date.startsWith(dateString));
      const hasIncome = dayTxs.some(tx => tx.type === 'income');
      const hasExpense = dayTxs.some(tx => tx.type === 'expense');

      days.push(
        <div key={d} className="cal-day" style={{
          padding: '10px 5px',
          textAlign: 'center',
          background: 'var(--kb-surface)',
          borderRadius: '8px',
          minHeight: '60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 'bold', color: 'var(--kb-text)' }}>{d}</span>
          <div style={{ display: 'flex', gap: '3px', marginTop: '5px' }}>
            {hasIncome && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--kb-income)' }}></div>}
            {hasExpense && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--kb-expense)' }}></div>}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="page-wrapper" style={{ padding: '20px' }}>
      <h1 className="classic-title">Calendar</h1>
      
      <div style={{
        background: 'var(--kb-bg)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: 'var(--kb-shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={prevMonth} className="classic-btn" style={{ padding: '5px 15px', background: 'var(--kb-surface)', color: 'var(--kb-text)' }}>&lt;</button>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--kb-text)', margin: 0 }}>{monthNames[month]} {year}</h2>
          <button onClick={nextMonth} className="classic-btn" style={{ padding: '5px 15px', background: 'var(--kb-surface)', color: 'var(--kb-text)' }}>&gt;</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginBottom: '10px' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} style={{ textAlign: 'center', color: 'var(--kb-text-light)', fontSize: '0.9rem', fontWeight: 'bold' }}>{day}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
          {renderDays()}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: 'var(--kb-text-light)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--kb-income)' }}></div> Cash In
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: 'var(--kb-text-light)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--kb-expense)' }}></div> Cash Out
          </div>
        </div>
      </div>

      <div style={{ height: '80px' }}></div>
    </div>
  );
}
