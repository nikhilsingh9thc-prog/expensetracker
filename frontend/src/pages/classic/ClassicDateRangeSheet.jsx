import React, { useState, useEffect, useRef } from 'react';

const ClassicDateRangeSheet = ({ isOpen, onClose, onSelect, initialRange }) => {
  const [activeTab, setActiveTab] = useState('Month');
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  const sheetRef = useRef(null);

  // Tabs: Month, Year, Day, Custom
  const tabs = ['Month', 'Year', 'Day', 'Custom'];

  // Data for Month Tab
  const getMonthList = () => {
    const months = [];
    const now = new Date();
    
    // This Month
    months.push({ label: 'This Month', value: 'this_month', date: new Date(now.getFullYear(), now.getMonth(), 1) });
    
    // Last Month
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    months.push({ label: 'Last Month', value: 'last_month', date: lastMonth });
    
    // Previous months
    for (let i = 2; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      months.push({ label, value: `month_${i}`, date: d });
    }
    
    months.push({ label: 'All Time', value: 'all_time', date: null });
    return months;
  };

  // Data for Year Tab
  const getYearList = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  const handleSelect = (type, value, label, extraData = {}) => {
    onSelect({ type, value, label, ...extraData });
    onClose();
  };

  // Touch handlers for swipe down to close
  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    const y = e.touches[0].clientY;
    if (y > startY) {
      setCurrentY(y - startY);
    }
  };

  const handleTouchEnd = () => {
    if (currentY > 100) {
      onClose();
    }
    setCurrentY(0);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`kb-bottom-sheet-overlay ${isOpen ? 'open' : ''}`} 
      onClick={onClose}
    >
      <div 
        className="kb-bottom-sheet" 
        onClick={e => e.stopPropagation()}
        ref={sheetRef}
        style={{ transform: currentY > 0 ? `translateY(${currentY}px)` : '' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="kb-sheet-handle"></div>
        
        <div className="kb-sheet-header">
          <h3 className="kb-sheet-title">Date Range</h3>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="kb-sheet-tabs">
          {tabs.map(tab => (
            <button 
              key={tab} 
              className={`kb-sheet-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="kb-sheet-content">
          {activeTab === 'Month' && (
            <div className="kb-range-list">
              {getMonthList().map(item => (
                <div 
                  key={item.value} 
                  className={`kb-range-item ${initialRange?.value === item.value ? 'active' : ''}`}
                  onClick={() => handleSelect('month', item.value, item.label)}
                >
                  <span>{item.label}</span>
                  <span className="check">✓</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Year' && (
            <div className="kb-year-grid">
              {getYearList().map(year => (
                <div 
                  key={year} 
                  className={`kb-year-item ${initialRange?.value === year ? 'active' : ''}`}
                  onClick={() => handleSelect('year', year, year.toString())}
                >
                  {year}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Day' && (
            <div className="kb-range-list">
              {['Today', 'Yesterday', 'Select Day'].map(day => (
                <div 
                  key={day} 
                  className="kb-range-item"
                  onClick={() => handleSelect('day', day.toLowerCase(), day)}
                >
                  <span>{day}</span>
                  <span className="check">✓</span>
                </div>
              ))}
              <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--kb-text-light)', textAlign: 'center' }}>
                Calendar view coming soon
              </div>
            </div>
          )}

          {activeTab === 'Custom' && (
            <div className="kb-custom-range">
              <div className="kb-input-group">
                <label>Start Date</label>
                <input 
                  type="date" 
                  value={customRange.startDate} 
                  onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
                />
              </div>
              <div className="kb-input-group">
                <label>End Date</label>
                <input 
                  type="date" 
                  value={customRange.endDate} 
                  onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
                />
              </div>
              <button 
                className="kb-apply-btn"
                onClick={() => {
                  if (customRange.startDate && customRange.endDate) {
                    handleSelect('custom', 'custom_range', `${customRange.startDate} - ${customRange.endDate}`, {
                      startDate: customRange.startDate,
                      endDate: customRange.endDate
                    });
                  } else {
                    alert("Please select both start and end dates");
                  }
                }}
              >
                Apply Range
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassicDateRangeSheet;
