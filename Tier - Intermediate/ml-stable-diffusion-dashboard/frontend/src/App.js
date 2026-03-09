import React, { useState, useEffect } from 'react';
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import StatusBar from './components/StatusBar';
import Overview from './pages/Overview';
import Commits from './pages/Commits';
import PullRequests from './pages/PullRequests';
import Issues from './pages/Issues';
import Contributors from './pages/Contributors';
import { repositoryAPI, analyticsAPI } from './services/api';
import './styles/globals.css';
import './App.css';

function App() {
    const [activePage, setActivePage] = useState('overview');
    const [repoData, setRepoData] = useState(null);
    const [stats, setStats] = useState(null);
    const [commitActivity, setCommitActivity] = useState([]);
    const [prStats, setPrStats] = useState([]);
    const [issueStats, setIssueStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchCoreData = async () => {
        try {
            const [repoRes, statsRes, activityRes, prRes, issueRes] = await Promise.all([
                repositoryAPI.getInfo(),
                analyticsAPI.getOverview(),
                analyticsAPI.getCommitActivity(30),
                analyticsAPI.getPRStats(),
                analyticsAPI.getIssueStats(),
            ]);
            setRepoData(repoRes.data);
            setStats(statsRes.data);
            setCommitActivity(activityRes.data);
            setPrStats(prRes.data);
            setIssueStats(issueRes.data);
            setLastUpdated(new Date());
        } catch (e) {
            console.error('Failed to fetch core data:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoreData();
        const interval = setInterval(fetchCoreData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const renderPage = () => {
        switch (activePage) {
            case 'overview': return <Overview stats={stats} repoData={repoData} commitActivity={commitActivity} prStats={prStats} issueStats={issueStats} />;
            case 'commits': return <Commits />;
            case 'pulls': return <PullRequests />;
            case 'issues': return <Issues />;
            case 'contributors': return <Contributors />;
            default: return <Overview stats={stats} repoData={repoData} commitActivity={commitActivity} />;
        }
    };

    if (loading) {
        return (
            <div className="app-loading">
                <div className="loading-spinner"></div>
                <span className="loading-text">initializing...</span>
            </div>
        );
    }

    return (
        <div className="app">
            <div className="app-body">
                <ActivityBar activePage={activePage} onPageChange={setActivePage} />
                <Sidebar activePage={activePage} repoData={repoData} stats={stats} />
                <div className="editor-area">
                    <TabBar activePage={activePage} onPageChange={setActivePage} />
                    <div className="editor-content">
                        {renderPage()}
                    </div>
                </div>
            </div>
            <StatusBar repoData={repoData} lastUpdated={lastUpdated} onRefresh={fetchCoreData} />
        </div>
    );
}

export default App;
