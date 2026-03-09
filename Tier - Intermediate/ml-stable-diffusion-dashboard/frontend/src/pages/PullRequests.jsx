import React, { useState, useEffect } from 'react';
import { pullRequestsAPI } from '../services/api';
import './TablePage.css';

const PullRequests = () => {
    const [prs, setPrs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(0);
    const limit = 20;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await pullRequestsAPI.getAll(filter, limit, page * limit);
                setPrs(res.data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filter, page]);

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    }) : '—';

    const stateColor = (state, merged) => {
        if (merged) return 'text-purple';
        if (state === 'open') return 'text-green';
        return 'text-red';
    };

    const stateLabel = (state, merged) => {
        if (merged) return 'merged';
        if (state === 'open') return 'open';
        return 'closed';
    };

    return (
        <div className="table-page fade-in">
            <div className="page-title">
                <span className="page-title-icon">⑂</span>
                pull_requests.md
                <span className="page-title-count">{prs.length} entries</span>
            </div>

            <div className="filter-bar">
                <span className="filter-label">filter:</span>
                {['all', 'open', 'closed'].map(f => (
                    <button
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => { setFilter(f); setPage(0); }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="table-loading">loading pull requests...</div>
            ) : (
                <>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>TITLE</th>
                                <th>STATE</th>
                                <th>AUTHOR</th>
                                <th>CREATED</th>
                                <th>MERGED</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prs.map(pr => (
                                <tr key={pr.pr_number}>
                                    <td><span className="mono text-muted">#{pr.pr_number}</span></td>
                                    <td className="commit-msg">{pr.title}</td>
                                    <td>
                                        <span className={`mono ${stateColor(pr.state, pr.merged_at)}`}>
                                            {stateLabel(pr.state, pr.merged_at)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="author-cell">
                                            {pr.avatar_url && <img src={pr.avatar_url} alt="" className="avatar-xs" />}
                                            <span className="text-green">{pr.username || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="mono text-muted">{formatDate(pr.created_at)}</td>
                                    <td className="mono text-muted">{formatDate(pr.merged_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="page-btn">prev</button>
                        <span className="page-info">page {page + 1}</span>
                        <button disabled={prs.length < limit} onClick={() => setPage(p => p + 1)} className="page-btn">next</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PullRequests;
