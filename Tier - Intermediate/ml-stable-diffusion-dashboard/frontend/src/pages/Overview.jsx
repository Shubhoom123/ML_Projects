import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './Overview.css';

const StatCard = ({ label, value, sub, color, icon }) => (
    <div className="stat-card">
        <div className="stat-card-header">
            <span className="stat-icon" style={{ color }}>{icon}</span>
            <span className="stat-label">{label}</span>
        </div>
        <div className="stat-value" style={{ color }}>{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Overview = ({ stats, repoData, commitActivity, prStats, issueStats }) => {
    if (!stats || !repoData) return <div className="page-loading">Loading overview...</div>;

    const chartData = (commitActivity || []).map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        commits: parseInt(item.commit_count) || 0,
        additions: parseInt(item.total_additions) || 0,
        deletions: parseInt(item.total_deletions) || 0,
    })).reverse();

    const prPieData = [
        { name: 'Merged', value: parseInt(stats.merged_prs) || 0, color: '#4ec9b0' },
        { name: 'Open', value: parseInt(stats.open_prs) || 0, color: '#4fc1ff' },
        { name: 'Closed', value: Math.max(0, parseInt(stats.total_prs) - parseInt(stats.merged_prs) - parseInt(stats.open_prs)) || 0, color: '#f44747' },
    ];

    const issuePieData = [
        { name: 'Open', value: parseInt(stats.open_issues) || 0, color: '#f44747' },
        { name: 'Closed', value: parseInt(stats.closed_issues) || 0, color: '#4ec9b0' },
    ];

    return (
        <div className="overview-page fade-in">
            <div className="page-header">
                <span className="breadcrumb">apple</span>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb active">ml-stable-diffusion</span>
                <span className="breadcrumb-desc">{repoData.description}</span>
            </div>

            <div className="stats-row">
                <StatCard label="Stars" value={repoData.stars?.toLocaleString()} icon="★" color="var(--text-yellow)" />
                <StatCard label="Forks" value={repoData.forks?.toLocaleString()} icon="⑂" color="var(--text-blue)" />
                <StatCard label="Contributors" value={stats.total_contributors} icon="◈" color="var(--text-purple)" />
                <StatCard label="Commits" value={stats.total_commits} icon="○" color="var(--text-green)" />
                <StatCard label="Open Issues" value={stats.open_issues} icon="⊙" color="var(--text-red)" sub={`${stats.closed_issues} closed`} />
                <StatCard label="Open PRs" value={stats.open_prs} icon="⑂" color="var(--accent)" sub={`${stats.merged_prs} merged`} />
            </div>

            <div className="charts-grid">
                <div className="chart-card wide">
                    <div className="chart-header">
                        <span className="chart-title">commit_activity.log</span>
                        <span className="chart-sub">last 30 days</span>
                    </div>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="commitsGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0078d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0078d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="commits" stroke="#0078d4" fill="url(#commitsGrad)" strokeWidth={2} name="Commits" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data">no recent commit data</div>
                    )}
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <span className="chart-title">code_churn.diff</span>
                    </div>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData.slice(0, 14)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="additions" fill="#4ec9b0" name="Additions" radius={[2,2,0,0]} />
                                <Bar dataKey="deletions" fill="#f44747" name="Deletions" radius={[2,2,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data">no churn data</div>
                    )}
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <span className="chart-title">pr_status.json</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={prPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                                {prPieData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend formatter={(value) => <span style={{ color: 'var(--text-primary)', fontSize: 12 }}>{value}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <span className="chart-title">issue_status.json</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={issuePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                                {issuePieData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend formatter={(value) => <span style={{ color: 'var(--text-primary)', fontSize: 12 }}>{value}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Overview;
