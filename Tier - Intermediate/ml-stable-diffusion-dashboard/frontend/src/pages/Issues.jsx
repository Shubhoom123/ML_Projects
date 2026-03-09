import React, { useState, useEffect } from 'react';
import { issuesAPI } from '../services/api';
import './TablePage.css';

const Issues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(0);
    const limit = 20;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await issuesAPI.getAll(filter, limit, page * limit);
                setIssues(res.data.data);
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

    return (
        <div className="table-page fade-in">
            <div className="page-title">
                <span className="page-title-icon">⊙</span>
                issues.md
                <span className="page-title-count">{issues.length} entries</span>
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
                <div className="table-loading">loading issues...</div>
            ) : (
                <>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>TITLE</th>
                                <th>STATE</th>
                                <th>AUTHOR</th>
                                <th>LABELS</th>
                                <th>COMMENTS</th>
                                <th>CREATED</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.map(issue => (
                                <tr key={issue.issue_number}>
                                    <td><span className="mono text-muted">#{issue.issue_number}</span></td>
                                    <td className="commit-msg">{issue.title}</td>
                                    <td>
                                        <span className={`mono ${issue.state === 'open' ? 'text-red' : 'text-green'}`}>
                                            {issue.state === 'open' ? 'open' : 'closed'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="author-cell">
                                            {issue.avatar_url && <img src={issue.avatar_url} alt="" className="avatar-xs" />}
                                            <span className="text-green">{issue.username || '—'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="labels-cell">
                                            {(issue.labels || []).slice(0, 2).map(label => (
                                                <span key={label} className="label-tag">{label}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="mono text-muted">{issue.comments_count}</td>
                                    <td className="mono text-muted">{formatDate(issue.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="page-btn">prev</button>
                        <span className="page-info">page {page + 1}</span>
                        <button disabled={issues.length < limit} onClick={() => setPage(p => p + 1)} className="page-btn">next</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Issues;
