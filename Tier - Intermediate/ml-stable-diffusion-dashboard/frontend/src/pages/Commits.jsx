import React, { useState, useEffect } from 'react';
import { commitsAPI } from '../services/api';
import './TablePage.css';

const Commits = () => {
    const [commits, setCommits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const limit = 20;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await commitsAPI.getRecent(limit, page * limit);
                setCommits(res.data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [page]);

    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const shortSha = (sha) => sha?.substring(0, 7);

    return (
        <div className="table-page fade-in">
            <div className="page-title">
                <span className="page-title-icon">○</span>
                commits.log
                <span className="page-title-count">{commits.length} entries</span>
            </div>

            {loading ? (
                <div className="table-loading">loading commits...</div>
            ) : (
                <>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>SHA</th>
                                <th>MESSAGE</th>
                                <th>AUTHOR</th>
                                <th>DATE</th>
                                <th>+/-</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commits.map(commit => (
                                <tr key={commit.sha}>
                                    <td>
                                        <span className="mono text-blue">{shortSha(commit.sha)}</span>
                                    </td>
                                    <td className="commit-msg">
                                        {commit.message?.split('\n')[0].substring(0, 72)}
                                    </td>
                                    <td>
                                        <div className="author-cell">
                                            {commit.avatar_url && (
                                                <img src={commit.avatar_url} alt="" className="avatar-xs" />
                                            )}
                                            <span className="text-green">{commit.username || 'unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="mono text-muted">{formatDate(commit.commit_date)}</td>
                                    <td>
                                        <span className="text-green">+{commit.additions}</span>
                                        {' '}
                                        <span className="text-red">-{commit.deletions}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="page-btn">prev</button>
                        <span className="page-info">page {page + 1}</span>
                        <button disabled={commits.length < limit} onClick={() => setPage(p => p + 1)} className="page-btn">next</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Commits;
