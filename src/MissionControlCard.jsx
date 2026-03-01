import React, { useState, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';

const getRank = (xp) => {
    if (xp < 100) return { title: "Code Rookie", max: 100 };
    if (xp < 300) return { title: "Debug Warrior", max: 300 };
    if (xp < 700) return { title: "Logic Master", max: 700 };
    if (xp < 1500) return { title: "Algorithm Knight", max: 1500 };
    return { title: "System Architect", max: xp + 1000 };
};

const MissionControlCard = ({ stats }) => {
    if (!stats) return null;

    const xp = stats.xp_points;
    const rank = getRank(xp);
    const progressPercent = Math.min((xp / rank.max) * 100, 100);

    const [customRank, setCustomRank] = useState('');
    const [isEditingRank, setIsEditingRank] = useState(false);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        const savedRank = localStorage.getItem('customUserRank');
        if (savedRank) {
            setCustomRank(savedRank);
        }
    }, []);

    const handleEditStart = () => {
        setEditValue(customRank || rank.title);
        setIsEditingRank(true);
    };

    const handleEditSave = () => {
        if (editValue.trim() === '') {
            setCustomRank('');
            localStorage.removeItem('customUserRank');
        } else {
            setCustomRank(editValue.trim());
            localStorage.setItem('customUserRank', editValue.trim());
        }
        setIsEditingRank(false);
    };

    const handleEditCancel = () => {
        setIsEditingRank(false);
    };

    const displayRank = customRank || rank.title;

    // Auto-generate a daily mission based on least used feature
    const features = [
        { name: 'Bug Fixes', val: stats.total_bugs_fixed },
        { name: 'Explanations', val: stats.total_explanations },
        { name: 'Optimizations', val: stats.total_optimizations },
        { name: 'Test Cases', val: stats.total_testcases_generated },
        { name: 'Complexity', val: stats.total_complexity_checks }
    ];

    const sorted = [...features].sort((a, b) => a.val - b.val);
    const dailyMission = `Perform 3 ${sorted[0].name} today`;

    return (
        <div className="dashboard-section mission-card">
            <div className="mission-header">
                {isEditingRank ? (
                    <div className="rank-edit-container">
                        <input
                            type="text"
                            className="rank-edit-input"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                            maxLength={24}
                        />
                        <button className="rank-edit-btn save" onClick={handleEditSave}><Check size={16} /></button>
                        <button className="rank-edit-btn cancel" onClick={handleEditCancel}><X size={16} /></button>
                    </div>
                ) : (
                    <div className="rank-title-group" onClick={handleEditStart} title="Click to change your rank">
                        <h2 className="rank-title">{displayRank}</h2>
                        <button className="rank-edit-icon"><Edit2 size={14} /></button>
                    </div>
                )}
                <span className="xp-badge">{xp} XP</span>
            </div>

            <div className="xp-progress-container">
                <div className="xp-progress-bar" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="xp-labels">
                <span>0</span>
                <span>{rank.max} XP Next Rank</span>
            </div>

            <div className="mission-details">
                <div className="streak-box">
                    <span className="streak-value">{stats.streak_days}</span>
                    <span className="streak-label">Day Streak</span>
                </div>
                <div className="daily-mission-box">
                    <h4>Daily Mission</h4>
                    <p>{dailyMission}</p>
                </div>
            </div>
        </div>
    );
};

export default MissionControlCard;
