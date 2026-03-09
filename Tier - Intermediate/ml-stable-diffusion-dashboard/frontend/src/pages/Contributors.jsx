import React, { useState, useEffect } from 'react';
import { contributorsAPI } from '../services/api';
import './TablePage.css';
import './Contributors.css';

const Contributors = () => {
    const [contributors, setContributors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await contributorsAPI.getAll(50);
                setContributors(res.data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const maxContributions = contributors[0]?.contributions || 1;

    return (
        <div className="table-page fade-in">
            <div className="page-title">
                <span className="page-title-icon">◈</span>
                contributors.ts
                <span className="page-title-count">{contributors.length} total</span>
            </div>

            {loading ? (
                <div className="table-loading">loading contributors...</div>
            ) : (
                <div className="contributors-grid">
                    {contributors.map((contributor, index) => (
                        <div key={contributor.user_id} className="contributor-card">
                            <div className="contributor-rank-badge">
                                #{index + 1}
                            </div>
                            <img
                                src={contributor.avatar_url}
                                alt={contributor.username}
                                className="contributor-avatar"
                            />
                            <div className="contributor-details">
                                <a
                                    href={contributor.profile_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contributor-username"
                                >
                                    {contributor.username}
                                </a>
                                <div className="contribution-bar-container">
                                    <div
                                        className="contribution-bar"
                                        style={{
                                            width: `${(contributor.contributions / maxContributions) * 100}%`
                                        }}
                                    ></div>
                                </div>
                                <span className="contribution-count">
                                    {contributor.contributions} contributions
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Contributors;