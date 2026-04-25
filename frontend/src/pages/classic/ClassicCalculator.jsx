import React, { useState } from 'react';

export default function ClassicCalculator() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNum = (num) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOp = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleEqual = () => {
    try {
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  return (
    <div className="page-wrapper" style={{ padding: '20px' }}>
      <h1 className="classic-title">Cash Calculator</h1>
      <div style={{
        background: 'var(--kb-bg)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: 'var(--kb-shadow)'
      }}>
        <div style={{
          background: 'var(--kb-surface)',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'right',
          marginBottom: '20px',
          minHeight: '80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end'
        }}>
          <div style={{ color: 'var(--kb-text-light)', fontSize: '1rem', minHeight: '20px' }}>{equation}</div>
          <div style={{ color: 'var(--kb-text)', fontSize: '2.5rem', fontWeight: 'bold' }}>{display}</div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {['7', '8', '9', '/'].map(btn => (
            <button key={btn} className="classic-btn" onClick={() => ['/','*','-','+'].includes(btn) ? handleOp(btn) : handleNum(btn)} style={{ padding: '20px', fontSize: '1.5rem', background: ['/','*','-','+'].includes(btn) ? 'var(--kb-accent-gradient)' : 'var(--kb-surface)', color: ['/','*','-','+'].includes(btn) ? 'white' : 'var(--kb-text)' }}>{btn}</button>
          ))}
          {['4', '5', '6', '*'].map(btn => (
            <button key={btn} className="classic-btn" onClick={() => ['/','*','-','+'].includes(btn) ? handleOp(btn) : handleNum(btn)} style={{ padding: '20px', fontSize: '1.5rem', background: ['/','*','-','+'].includes(btn) ? 'var(--kb-accent-gradient)' : 'var(--kb-surface)', color: ['/','*','-','+'].includes(btn) ? 'white' : 'var(--kb-text)' }}>{btn}</button>
          ))}
          {['1', '2', '3', '-'].map(btn => (
            <button key={btn} className="classic-btn" onClick={() => ['/','*','-','+'].includes(btn) ? handleOp(btn) : handleNum(btn)} style={{ padding: '20px', fontSize: '1.5rem', background: ['/','*','-','+'].includes(btn) ? 'var(--kb-accent-gradient)' : 'var(--kb-surface)', color: ['/','*','-','+'].includes(btn) ? 'white' : 'var(--kb-text)' }}>{btn}</button>
          ))}
          {['C', '0', '=', '+'].map(btn => (
            <button key={btn} className="classic-btn" 
              onClick={() => {
                if (btn === 'C') handleClear();
                else if (btn === '=') handleEqual();
                else if (btn === '+') handleOp(btn);
                else handleNum(btn);
              }} 
              style={{ padding: '20px', fontSize: '1.5rem', background: ['='].includes(btn) ? 'var(--kb-income)' : ['+'].includes(btn) ? 'var(--kb-accent-gradient)' : btn === 'C' ? 'var(--kb-expense)' : 'var(--kb-surface)', color: ['=','+','C'].includes(btn) ? 'white' : 'var(--kb-text)' }}>
              {btn}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: '80px' }}></div>
    </div>
  );
}
