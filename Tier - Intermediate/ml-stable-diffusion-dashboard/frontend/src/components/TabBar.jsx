import React from 'react';
import './TabBar.css';

const tabs = [
    { id: 'overview', label: 'overview.json' },
    { id: 'commits', label: 'commits.log' },
    { id: 'pulls', label: 'pull_requests.md' },
    { id: 'issues', label: 'issues.md' },
    { id: 'contributors', label: 'contributors.ts' },
];

const TabBar = ({ activePage, onPageChange }) => {
    return (
        <div className="tab-bar">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`tab ${activePage === tab.id ? 'active' : ''}`}
                    onClick={() => onPageChange(tab.id)}
                >
                    <span className="tab-dot"></span>
                    <span className="tab-label">{tab.label}</span>
                    {activePage === tab.id && (
                        <span className="tab-close">×</span>
                    )}
                </button>
            ))}
            <div className="tab-bar-fill"></div>
        </div>
    );
};

export default TabBar;
