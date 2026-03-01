import React, { useState, useEffect } from 'react';
import { Bug, BookOpen, Settings, CheckSquare, Clock } from 'lucide-react';

// Animated Number Counter Hook
const useCounter = (end, duration = 1000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [end, duration]);

    return count;
};

const StatCard = ({ icon: Icon, title, value }) => {
    const animatedValue = useCounter(value || 0, 1500);

    return (
        <div className="stat-card">
            <div className="stat-icon-wrapper">
                <Icon size={24} />
            </div>
            <div className="stat-info">
                <h4 className="stat-title">{title}</h4>
                <span className="stat-value">{animatedValue}</span>
            </div>
        </div>
    );
};

const StatsGrid = ({ stats }) => {
    if (!stats) return null;

    return (
        <div className="dashboard-section stats-grid">
            <h3 className="section-heading">Operational Metrics</h3>
            <div className="stats-cards-container">
                <StatCard icon={Bug} title="Bugs Fixed" value={stats.total_bugs_fixed} />
                <StatCard icon={BookOpen} title="Explanations" value={stats.total_explanations} />
                <StatCard icon={Settings} title="Optimizations" value={stats.total_optimizations} />
                <StatCard icon={CheckSquare} title="Test Cases" value={stats.total_testcases_generated} />
                <StatCard icon={Clock} title="Complexity Checks" value={stats.total_complexity_checks} />
            </div>
        </div>
    );
};

export default StatsGrid;
