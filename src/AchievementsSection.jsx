import React from 'react';
import { Award, Zap, Shield, Target, Rocket } from 'lucide-react';

const AchievementsSection = ({ stats }) => {
    if (!stats) return null;

    const badges = [
        { id: 'first_bug', name: 'First Bug Fix', icon: Shield, unlocked: stats.total_bugs_fixed > 0 },
        { id: 'five_exp', name: '5 Explanations', icon: BookOpenIcon, unlocked: stats.total_explanations >= 5 },
        { id: 'three_opt', name: 'Optimizer', icon: Zap, unlocked: stats.total_optimizations >= 3 },
        { id: 'streak_3', name: '3-Day Streak', icon: Target, unlocked: stats.streak_days >= 3 },
        { id: 'pro_launch', name: 'Pro Launch', icon: Rocket, unlocked: true }, // Unlocked by reaching dashboard
    ];

    return (
        <div className="dashboard-section achievements">
            <h3 className="section-heading">Achievements</h3>
            <div className="badges-grid">
                {badges.map(badge => {
                    const Icon = badge.icon;
                    return (
                        <div key={badge.id} className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}>
                            <div className="badge-icon-wrapper">
                                <Icon size={28} />
                            </div>
                            <span className="badge-name">{badge.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Quick helper to avoid importing huge custom icon for book
const BookOpenIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
);

export default AchievementsSection;
