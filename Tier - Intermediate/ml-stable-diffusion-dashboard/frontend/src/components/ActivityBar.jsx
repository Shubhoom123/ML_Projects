import React from 'react';
import './ActivityBar.css';

const icons = [
    { id: 'overview', label: 'Overview', icon: '⬡' },
    { id: 'commits', label: 'Commits', icon: '○' },
    { id: 'pulls', label: 'Pull Requests', icon: '⑂' },
    { id: 'issues', label: 'Issues', icon: '⊙' },
    { id: 'contributors', label: 'Contributors', icon: '◈' },
];

const ActivityBar = ({ activePage, onPageChange }) => {
    return (
        <div className="activity-bar">
            <div className="activity-bar-top">
                {icons.map(item => (
                    <button
                        key={item.id}
                        className={`activity-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => onPageChange(item.id)}
                        title={item.label}
                    >
                        <span className="activity-icon">{item.icon}</span>
                    </button>
                ))}
            </div>
            <div className="activity-bar-bottom">
                <button className="activity-item" title="Settings">
                    <span className="activity-icon">⚙</span>
                </button>
            </div>
        </div>
    );
};

export default ActivityBar;
