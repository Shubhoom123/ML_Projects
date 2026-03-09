const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { daysValidation } = require('../middleware/validation');

// Get overview statistics
router.get('/overview', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM contributors) as total_contributors,
                (SELECT COUNT(*) FROM commits) as total_commits,
                (SELECT COUNT(*) FROM pull_requests) as total_prs,
                (SELECT COUNT(*) FROM pull_requests WHERE state = 'open') as open_prs,
                (SELECT COUNT(*) FROM pull_requests WHERE merged_at IS NOT NULL) as merged_prs,
                (SELECT COUNT(*) FROM issues) as total_issues,
                (SELECT COUNT(*) FROM issues WHERE state = 'open') as open_issues,
                (SELECT COUNT(*) FROM issues WHERE state = 'closed') as closed_issues
        `);
        
        res.json(stats.rows[0]);
    } catch (error) {
        console.error('Error fetching overview:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get commit activity by day - FIXED SQL INJECTION
router.get('/commit-activity', daysValidation, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        
        // Use parameterized query instead of string interpolation
        const result = await pool.query(`
            SELECT 
                DATE(commit_date) as date,
                COUNT(*) as commit_count,
                SUM(additions) as total_additions,
                SUM(deletions) as total_deletions
            FROM commits
            WHERE commit_date >= CURRENT_DATE - INTERVAL '1 day' * $1
            GROUP BY DATE(commit_date)
            ORDER BY date DESC
        `, [days]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching commit activity:', error);
        res.status(500).json({ error: 'Failed to fetch commit activity' });
    }
});

// Get PR statistics
router.get('/pr-stats', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                state,
                COUNT(*) as count,
                AVG(EXTRACT(EPOCH FROM (COALESCE(merged_at, closed_at) - created_at))) / 86400 as avg_days_to_close
            FROM pull_requests
            GROUP BY state
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching PR stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get issue statistics
router.get('/issue-stats', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                state,
                COUNT(*) as count,
                AVG(comments_count) as avg_comments,
                AVG(CASE WHEN closed_at IS NOT NULL 
                    THEN EXTRACT(EPOCH FROM (closed_at - created_at)) / 86400 
                    ELSE NULL END) as avg_days_to_close
            FROM issues
            GROUP BY state
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching issue stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;
