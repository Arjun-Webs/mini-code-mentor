import React, { useEffect, useState } from 'react';

const SkillRadar = ({ stats }) => {
    const [animatedStats, setAnimatedStats] = useState({
        bug_fix: 0,
        explanation: 0,
        optimize: 0,
        testcase: 0,
        complexity: 0
    });

    useEffect(() => {
        if (!stats) return;

        // Animate the widths of the bars on load
        const timeout = setTimeout(() => {
            setAnimatedStats({
                bug_fix: stats.total_bugs_fixed,
                explanation: stats.total_explanations,
                optimize: stats.total_optimizations,
                testcase: stats.total_testcases_generated,
                complexity: stats.total_complexity_checks
            });
        }, 100);

        return () => clearTimeout(timeout);
    }, [stats]);

    if (!stats) return null;

    // Calculate percentages based on the max stat
    const maxStat = Math.max(
        animatedStats.bug_fix,
        animatedStats.explanation,
        animatedStats.optimize,
        animatedStats.testcase,
        animatedStats.complexity,
        1 // Prevent division by zero
    );

    const getPercent = (val) => `${(val / maxStat) * 100}%`;

    const skills = [
        { label: "Debugging", val: animatedStats.bug_fix, color: "#ef4444" },
        { label: "Comprehension", val: animatedStats.explanation, color: "#f97316" },
        { label: "Optimization", val: animatedStats.optimize, color: "#f43f5e" },
        { label: "Reliability", val: animatedStats.testcase, color: "#fb923c" },
        { label: "Performance", val: animatedStats.complexity, color: "#b91c1c" },
    ];

    return (
        <div className="dashboard-section skill-radar">
            <h3 className="section-heading">Skill Profile</h3>
            <div className="skills-container">
                {skills.map(skill => (
                    <div key={skill.label} className="skill-row">
                        <span className="skill-label">{skill.label}</span>
                        <div className="skill-bar-bg">
                            <div
                                className="skill-bar-fill"
                                style={{ width: getPercent(skill.val), backgroundColor: skill.color }}
                            ></div>
                        </div>
                        <span className="skill-val">{skill.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SkillRadar;
