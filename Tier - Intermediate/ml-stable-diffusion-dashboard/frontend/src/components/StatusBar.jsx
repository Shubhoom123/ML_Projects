import React from 'react';
import './StatusBar.css';

const StatusBar = ({ repoData, lastUpdated, onRefresh }) => {
    const formatTime = (date) => {
        if (!date) return 'Never';
        return date.toLocaleTimeString();
    };

    return (
        <div className="status-bar">
            <div className="status-left">
                <span className="status-item status-branch">
                    ⑂ main
                </span>
                <span className="status-item">
                    ⊙ {repoData?.open_issues || 0} issues
                </span>
                <span className="status-item">
                    ⑂ {repoData?.forks || 0} forks
                </span>
            </div>
            <div className="status-right">
                <span className="status-item">
                    Last synced: {formatTime(lastUpdated)}
                </span>
                <button className="status-item status-btn" onClick={onRefresh}>
                    ↻ Refresh
                </button>
                <span className="status-item">
                    UTF-8
                </span>
                <span className="status-item">
                    apple/ml-stable-diffusion
                </span>
            </div>
        </div>
    );
};

export default StatusBar;
