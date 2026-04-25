import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useCurrency } from '../../context/CurrencyContext';
import './ClassicTheme.css';

const ClassicSavingsGoal = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', target_amount: '', daily_saving_target: '' });
    const { currency } = useCurrency();

    const fetchData = async () => {
        try {
            const res = await api.get('/goals/');
            setGoals(res.data.results || res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/goals/', formData);
            setShowForm(false);
            setFormData({ name: '', target_amount: '', daily_saving_target: '' });
            fetchData();
        } catch (e) {
            alert("Error saving goal");
        }
    };

    const logDaily = async (goalId, saved, gap) => {
        try {
            await api.post(`/goals/${goalId}/log_progress/`, {
                amount_saved: saved,
                extra_spending: gap
            });
            fetchData();
        } catch (e) {
            alert("Error logging progress");
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

    return (
        <div className="classic-page-content" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid var(--kb-border)' }}>
                <h2 style={{ margin: '0 0 10px 0' }}>Savings Goals</h2>
                <button className="classic-btn" onClick={() => setShowForm(!showForm)} style={{ marginBottom: '10px' }}>
                    {showForm ? 'Cancel' : '+ New Goal'}
                </button>
            </div>

            {showForm && (
                <div style={{ background: 'var(--kb-card-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--kb-border)', marginBottom: '20px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block' }}>Goal Name:</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '8px' }} required />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block' }}>Target Amount ({currency.symbol}):</label>
                                <input type="number" value={formData.target_amount} onChange={e => setFormData({...formData, target_amount: e.target.value})} style={{ width: '100%', padding: '8px' }} required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block' }}>Daily Target (Optional):</label>
                                <input type="number" value={formData.daily_saving_target} onChange={e => setFormData({...formData, daily_saving_target: e.target.value})} style={{ width: '100%', padding: '8px' }} />
                            </div>
                        </div>
                        <button type="submit" className="classic-btn classic-btn-primary">Save Goal</button>
                    </form>
                </div>
            )}

            <div className="goals-list">
                {goals.map(goal => (
                    <div key={goal.id} style={{ 
                        background: 'var(--kb-card-bg)', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        border: '1px solid var(--kb-border)', 
                        marginBottom: '15px',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>{goal.name}</h3>
                            {goal.is_completed && <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓ COMPLETED</span>}
                        </div>
                        
                        <div style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                            <div>Target: {currency.symbol}{goal.target_amount}</div>
                            <div>Saved: {currency.symbol}{goal.current_saved}</div>
                            <div style={{ fontWeight: 'bold', marginTop: '5px' }}>Remaining: {currency.symbol}{goal.remaining_amount}</div>
                        </div>

                        {goal.daily_saving_target > 0 && (
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Daily Target: {currency.symbol}{goal.daily_saving_target}
                            </div>
                        )}

                        {goal.gap_info.has_gap && (
                            <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '4px' }}>
                                <div style={{ color: '#ef4444', fontWeight: 'bold' }}>GAP DETECTED: {currency.symbol}{goal.gap_info.total_gap}</div>
                                <div style={{ fontSize: '0.85rem' }}>{goal.gap_info.recovery_suggestion}</div>
                                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Extra days needed: {goal.gap_info.extra_days_needed}</div>
                            </div>
                        )}

                        {!goal.is_completed && (
                            <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid var(--kb-border)' }}>
                                <div style={{ fontSize: '0.85rem', marginBottom: '5px' }}>Log Today's Progress:</div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input id={`saved-${goal.id}`} type="number" placeholder="Amt Saved" style={{ flex: 1, padding: '5px' }} />
                                    <input id={`gap-${goal.id}`} type="number" placeholder="Gap" style={{ flex: 1, padding: '5px' }} />
                                    <button className="classic-btn" onClick={() => {
                                        const s = document.getElementById(`saved-${goal.id}`).value;
                                        const g = document.getElementById(`gap-${goal.id}`).value;
                                        logDaily(goal.id, s || 0, g || 0);
                                        document.getElementById(`saved-${goal.id}`).value = '';
                                        document.getElementById(`gap-${goal.id}`).value = '';
                                    }}>Add</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {goals.length === 0 && <p>No goals found. Create one above.</p>}
            </div>
        </div>
    );
};

export default ClassicSavingsGoal;
