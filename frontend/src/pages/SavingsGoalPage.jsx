import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useCurrency } from '../context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import './SavingsGoalPage.css';

const SavingsGoalPage = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', deadline: '', daily_saving_target: '' });
    const { currency } = useCurrency();
    const [notifs, setNotifs] = useState([]);

    const addNotif = (msg, type = 'info') => {
        const id = Date.now();
        setNotifs(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setNotifs(prev => prev.filter(n => n.id !== id)), 5000);
    };

    const fetchGoals = async () => {
        try {
            const res = await api.get('/goals/');
            setGoals(res.data.results || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleAddGoal = async (e) => {
        e.preventDefault();
        try {
            await api.post('/goals/', newGoal);
            setShowAddModal(false);
            setNewGoal({ name: '', target_amount: '', deadline: '', daily_saving_target: '' });
            fetchGoals();
            addNotif("Goal created successfully! 🎯", "success");
        } catch (err) {
            addNotif("Failed to create goal.", "error");
        }
    };

    const handleLogProgress = async (goalId, amount, gap) => {
        try {
            const res = await api.post(`/goals/${goalId}/log_progress/`, {
                amount_saved: amount,
                extra_spending: gap
            });
            fetchGoals();
            
            // Smart Guidance
            if (gap > 0) {
                const extraDays = res.data.gap_info.extra_days_needed;
                addNotif(`You overspent today by ${currency.symbol}${gap}. You need ${extraDays} extra days to recover your gap. ⚠️`, "warning");
            } else {
                addNotif("Great job! You're on track 🎯", "success");
            }
        } catch (err) {
            addNotif("Failed to log progress.", "error");
        }
    };

    if (loading) return <div className="loading-spinner">Loading Goals...</div>;

    return (
        <div className="savings-page-container">
            <header className="savings-header">
                <div className="header-text">
                    <h1>Smart Savings Goals</h1>
                    <p>Track your dreams and stay on the path to financial freedom.</p>
                </div>
                <button className="add-goal-btn" onClick={() => setShowAddModal(true)}>
                    <span>+</span> New Goal
                </button>
            </header>

            <div className="goals-grid">
                {goals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} currency={currency} onLog={handleLogProgress} />
                ))}
                {goals.length === 0 && (
                    <div className="no-goals">
                        <p>No savings goals yet. Start by creating one!</p>
                    </div>
                )}
            </div>

            {/* Notification Toast */}
            <div className="notif-container">
                <AnimatePresence>
                    {notifs.map(n => (
                        <motion.div 
                            key={n.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className={`notif-toast ${n.type}`}
                        >
                            {n.msg}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add Goal Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-content">
                        <h2>Set New Savings Goal</h2>
                        <form onSubmit={handleAddGoal}>
                            <div className="form-group">
                                <label>Goal Name</label>
                                <input type="text" placeholder="e.g. Buy iPhone" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Target Amount ({currency.symbol})</label>
                                    <input type="number" value={newGoal.target_amount} onChange={e => setNewGoal({...newGoal, target_amount: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Daily Saving Target (Optional)</label>
                                    <input type="number" value={newGoal.daily_saving_target} onChange={e => setNewGoal({...newGoal, daily_saving_target: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Deadline (Optional)</label>
                                <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">Cancel</button>
                                <button type="submit" className="submit-btn">Create Goal</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const GoalCard = ({ goal, currency, onLog }) => {
    const progress = (goal.current_saved / goal.target_amount) * 100;
    const [logAmount, setLogAmount] = useState('');
    const [gapAmount, setGapAmount] = useState('');
    const [showLogForm, setShowLogForm] = useState(false);

    const hasGap = goal.gap_info.has_gap;

    return (
        <motion.div className={`goal-card ${goal.is_completed ? 'completed' : ''}`} whileHover={{ y: -5 }}>
            <div className="card-header">
                <h3>{goal.name}</h3>
                {goal.is_completed && <span className="badge success">Completed! 🎉</span>}
            </div>
            
            <div className="amount-info">
                <div className="target">Target: {currency.symbol}{goal.target_amount}</div>
                <div className="saved">Saved: {currency.symbol}{goal.current_saved}</div>
            </div>

            <div className="progress-container">
                <div className="progress-bar-bg">
                    <motion.div 
                        className="progress-bar-fill" 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
                <div className="progress-label">{Math.round(progress)}% Completed</div>
            </div>

            <div className="card-stats">
                {goal.daily_saving_target > 0 && (
                    <div className="stat-item">
                        <span className="stat-label">Daily Target</span>
                        <span className="stat-value">{currency.symbol}{goal.daily_saving_target}</span>
                    </div>
                )}
                <div className="stat-item">
                    <span className="stat-label">Remaining</span>
                    <span className="stat-value">{currency.symbol}{goal.remaining_amount}</span>
                </div>
            </div>

            {hasGap && (
                <div className="gap-alert">
                    <div className="gap-title">⚠️ Gap Detected: {currency.symbol}{goal.gap_info.total_gap}</div>
                    <p className="gap-desc">{goal.gap_info.recovery_suggestion}</p>
                    <div className="gap-impact">Extra days to goal: <strong>{goal.gap_info.extra_days_needed}</strong></div>
                </div>
            )}

            {!goal.is_completed && (
                <div className="card-actions">
                    {!showLogForm ? (
                        <button className="log-btn" onClick={() => setShowLogForm(true)}>Log Daily Progress</button>
                    ) : (
                        <div className="log-form">
                            <div className="input-group">
                                <input type="number" placeholder="Amt Saved" value={logAmount} onChange={e => setLogAmount(e.target.value)} />
                                <input type="number" placeholder="Overspent (Gap)" value={gapAmount} onChange={e => setGapAmount(e.target.value)} />
                            </div>
                            <div className="log-actions">
                                <button onClick={() => {
                                    onLog(goal.id, logAmount || 0, gapAmount || 0);
                                    setLogAmount('');
                                    setGapAmount('');
                                    setShowLogForm(false);
                                }}>Save</button>
                                <button className="cancel" onClick={() => setShowLogForm(false)}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {goal.is_completed && (
                <div className="motivational-msg">
                    You've reached your goal! Your discipline paid off. 🥳
                </div>
            )}
        </motion.div>
    );
};

export default SavingsGoalPage;
