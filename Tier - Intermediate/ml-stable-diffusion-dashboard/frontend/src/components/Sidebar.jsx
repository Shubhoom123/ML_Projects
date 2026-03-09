import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activePage, repoData, stats }) => {
    const pages = {
        overview: 'EXPLORER',
        commits: 'COMMITS',
        pulls: 'PULL REQUESTS',
        issues: 'ISSUES',
        contributors: 'CONTRIBUTORS',
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                {pages[activePage] || 'EXPLORER'}
            </div>

            <div className="sidebar-section">
                <div className="sidebar-section-header">
                    <span>REPOSITORY</span>
                </div>
                {repoData && (
                    <div className="sidebar-repo">
                        <div className="sidebar-item">
                            <span className="sidebar-icon text-blue">⬡</span>
                            <span className="sidebar-label">{repoData.name}</span>
                        </div>
                        <div className="sidebar-item indent">
                            <span className="sidebar-icon text-yellow">★</span>
                            <span className="sidebar-label">{repoData.stars?.toLocaleString()} stars</span>
                        </div>
                        <div className="sidebar-item indent">
                            <span className="sidebar-icon text-green">⑂</span>
                            <span className="sidebar-label">{repoData.forks?.toLocaleString()} forks</span>
                        </div>
                        <div className="sidebar-item indent">
                            <span className="sidebar-icon text-red">⊙</span>
                            <span className="sidebar-label">{repoData.open_issues} open issues</span>
                        </div>
                    </div>
                )}
            </div>

            {stats && (
                <div className="sidebar-section">
                    <div className="sidebar-section-header">
                        <span>STATS</span>
                    </div>
                    <div className="sidebar-item">
                        <span className="sidebar-icon text-purple">◈</span>
                        <span className="sidebar-label">{stats.total_contributors} contributors</span>
                    </div>
                    <div className="sidebar-item">
                        <span className="sidebar-icon text-blue">○</span>
                        <span className="sidebar-label">{stats.total_commits} commits</span>
                    </div>
                    <div className="sidebar-item">
                        <span className="sidebar-icon text-green">✓</span>
                        <span className="sidebar-label">{stats.merged_prs} merged PRs</span>
                    </div>
                    <div className="sidebar-item">
                        <span className="sidebar-icon text-red">✗</span>
                        <span className="sidebar-label">{stats.closed_issues} closed issues</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
