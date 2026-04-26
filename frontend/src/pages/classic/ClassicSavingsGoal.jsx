import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import './ClassicTheme.css';

const ClassicSavingsGoal = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', target_amount: '' });
    const { currency } = useCurrency();

    const fetchData = () => {
        try {
            const savedGoals = JSON.parse(localStorage.getItem("savings_goals")) || [];
            setGoals(savedGoals);
        } catch (e) {
            console.error("Error loading goals from storage:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 1. Validation
        if (!formData.name.trim()) {
            alert("Goal name is required");
            return;
        }
        const target = parseFloat(formData.target_amount);
        if (isNaN(target) || target <= 0) {
            alert("Target amount must be greater than 0");
            return;
        }

        try {
            // 2. Prepare Data
            const newGoal = {
                id: Date.now(), // Unique ID
                name: formData.name.trim(),
                target_amount: target,
                current_saved: 0,
                is_completed: false,
                created_at: new Date().toISOString()
            };

            console.log("Saving new goal:", newGoal);

            // 3. Save to localStorage
            const existingGoals = JSON.parse(localStorage.getItem("savings_goals")) || [];
            const updatedGoals = [newGoal, ...existingGoals];
            localStorage.setItem("savings_goals", JSON.stringify(updatedGoals));

            // 4. Update UI immediately
            setGoals(updatedGoals);
            setShowForm(false);
            setFormData({ name: '', target_amount: '' });
            
        } catch (error) {
            console.error("Critical error saving goal:", error);
            alert("Failed to save goal. Please check console for details.");
        }
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;
        try {
            const existingGoals = JSON.parse(localStorage.getItem("savings_goals")) || [];
            const updatedGoals = existingGoals.filter(g => g.id !== id);
            localStorage.setItem("savings_goals", JSON.stringify(updatedGoals));
            setGoals(updatedGoals);
        } catch (e) {
            console.error("Error deleting goal:", e);
        }
    };

    const logProgress = (goalId) => {
        const amount = window.prompt("Enter amount to add to this goal:");
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;
        
        try {
            const existingGoals = JSON.parse(localStorage.getItem("savings_goals")) || [];
            const updatedGoals = existingGoals.map(goal => {
                if (goal.id === goalId) {
                    const newSaved = goal.current_saved + parseFloat(amount);
                    return {
                        ...goal,
                        current_saved: newSaved,
                        is_completed: newSaved >= goal.target_amount
                    };
                }
                return goal;
            });
            localStorage.setItem("savings_goals", JSON.stringify(updatedGoals));
            setGoals(updatedGoals);
        } catch (e) {
            console.error("Error logging progress:", e);
        }
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading goals...</div>;

    return (
        <div className="page-wrapper classic-savings-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 className="classic-title" style={{ margin: 0 }}>Savings Goals</h1>
                <button className="classic-btn classic-btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ New Goal'}
                </button>
            </div>

            {showForm && (
                <div className="classic-card" style={{ marginBottom: '30px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Goal Name:</label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--kb-border)' }} 
                                placeholder="e.g. New Phone, Vacation"
                                required 
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Target Amount ({currency.symbol}):</label>
                            <input 
                                type="number" 
                                value={formData.target_amount} 
                                onChange={e => setFormData({...formData, target_amount: e.target.value})} 
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--kb-border)' }} 
                                placeholder="0.00"
                                required 
                            />
                        </div>
                        <button type="submit" className="classic-btn classic-btn-primary" style={{ width: '100%' }}>Create Goal</button>
                    </form>
                </div>
            )}

            <div className="goals-list">
                {goals.map(goal => {
                    const progressPercent = Math.min(100, (goal.current_saved / goal.target_amount) * 100);
                    return (
                        <div key={goal.id} className="classic-card goal-card" style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{goal.name}</h3>
                                    <p style={{ margin: '5px 0 0 0', color: 'var(--kb-text-light)', fontSize: '0.9rem' }}>
                                        Target: {currency.symbol}{goal.target_amount.toLocaleString()}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--kb-accent)' }}>
                                        {Math.round(progressPercent)}%
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(goal.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', marginTop: '5px' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--kb-bg)', borderRadius: '5px', overflow: 'hidden', marginBottom: '15px' }}>
                                <div style={{ 
                                    width: `${progressPercent}%`, 
                                    height: '100%', 
                                    backgroundColor: 'var(--kb-accent)',
                                    transition: 'width 0.5s ease-out'
                                }}></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--kb-text-light)' }}>Remaining:</span>
                                    <span style={{ fontWeight: 'bold', marginLeft: '5px' }}>{currency.symbol}{Math.max(0, goal.target_amount - goal.current_saved).toLocaleString()}</span>
                                </div>
                                {!goal.is_completed && (
                                    <button className="classic-btn" onClick={() => logProgress(goal.id)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                                        + Add Savings
                                    </button>
                                )}
                                {goal.is_completed && <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '0.85rem' }}>GOAL REACHED!</span>}
                            </div>
                        </div>
                    );
                })}
                {goals.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--kb-text-light)' }}>
                        <p>No savings goals yet. Start by creating one!</p>
                    </div>
                )}
            </div>
            <div style={{ height: '80px' }}></div>
        </div>
    );
};

export default ClassicSavingsGoal;
