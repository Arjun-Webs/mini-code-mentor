import React from 'react';
import { Activity } from 'lucide-react';

const ActivityTimeline = ({ activities }) => {
    if (!activities || activities.length === 0) {
        return (
            <div className="dashboard-section timeline">
                <h3 className="section-heading">Recent Activity</h3>
                <p className="empty-timeline">No recent activity detected.</p>
            </div>
        );
    }

    const formatTimeAgo = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="dashboard-section timeline">
            <h3 className="section-heading">Recent Activity</h3>

            <div className="timeline-list">
                {activities.map((act, idx) => (
                    <div key={idx} className="timeline-item">
                        <div className="timeline-node">
                            <Activity size={14} />
                        </div>
                        <div className="timeline-content">
                            <p className="timeline-action">{act.action}</p>
                            <span className="timeline-time">{formatTimeAgo(act.timestamp)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityTimeline;
