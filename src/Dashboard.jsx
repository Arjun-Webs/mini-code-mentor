import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import MissionControlCard from './MissionControlCard';
import StatsGrid from './StatsGrid';
import SkillRadar from './SkillRadar';
import AchievementsSection from './AchievementsSection';
import ActivityTimeline from './ActivityTimeline';
import { ArrowLeft } from 'lucide-react';

const DEFAULT_STATS = {
    total_explanations: 0,
    total_bugs_fixed: 0,
    total_testcases_generated: 0,
    total_optimizations: 0,
    total_complexity_checks: 0,
    streak_days: 1,
    xp_points: 0,
    last_activity: []
};

const Dashboard = ({ onBack, token, username }) => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(false);

    // Poll for stats every 10 seconds
    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
                const res = await fetch("http://127.0.0.1:8000/user-stats", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                    setError(false);
                } else {
                    setStats(prev => prev || DEFAULT_STATS);
                    setError(true);
                }
            } catch (e) {
                console.error("Dashboard fetch error:", e);
                setStats(prev => prev || DEFAULT_STATS);
                setError(true);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, [token]);

    // If we don't have stats yet and haven't errored, show loading.
    // If we errored but set stats to DEFAULT_STATS, it skips this and shows the UI.
    if (!stats) {
        return (
            <div className="dashboard-loading fade-in">
                <div className="pulse-loader"></div>
                <p>Syncing Telemetry...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container fade-in">
            <div className="dashboard-header" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <button className="back-btn" onClick={onBack}>
                        <ArrowLeft size={20} />
                        <span>Back to Editor</span>
                    </button>
                    <div>
                        <h2 style={{ fontSize: '2rem', margin: 0 }}>
                            Welcome, <span style={{ color: 'var(--accent-primary)' }}>{username}</span>!
                        </h2>
                        <p style={{ color: 'var(--text-muted)', margin: 0, marginTop: '0.2rem' }}>Here are your coding telemetry stats.</p>
                    </div>
                </div>
                <span className="live-status">
                    <span className="pulse-dot"></span>
                    Live Sync
                </span>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-column left-column">
                    <MissionControlCard stats={stats} />
                    <SkillRadar stats={stats} />
                </div>

                <div className="dashboard-column center-column">
                    <StatsGrid stats={stats} />
                    <AchievementsSection stats={stats} />
                </div>

                <div className="dashboard-column right-column">
                    <ActivityTimeline activities={stats ? stats.last_activity : []} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
