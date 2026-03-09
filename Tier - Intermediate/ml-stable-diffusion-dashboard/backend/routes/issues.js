const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all issues
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const state = req.query.state || 'all';
        
        let query = `
            SELECT i.*, co.username, co.avatar_url
            FROM issues i
            LEFT JOIN contributors co ON i.author_id = co.user_id
        `;
        
        const params = [limit, offset];
        
        if (state !== 'all') {
            query += ' WHERE i.state = $3';
            params.push(state);
        }
        
        query += ' ORDER BY i.created_at DESC LIMIT $1 OFFSET $2';
        
        const result = await pool.query(query, params);
        
        const countQuery = state !== 'all' 
            ? 'SELECT COUNT(*) FROM issues WHERE state = $1'
            : 'SELECT COUNT(*) FROM issues';
        const countParams = state !== 'all' ? [state] : [];
        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);
        
        res.json({
            data: result.rows,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        });
    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({ error: 'Failed to fetch issues' });
    }
});

// Get issue by number
router.get('/:number', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT i.*, co.username, co.avatar_url
            FROM issues i
            LEFT JOIN contributors co ON i.author_id = co.user_id
            WHERE i.issue_number = $1
        `, [req.params.number]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Issue not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching issue:', error);
        res.status(500).json({ error: 'Failed to fetch issue' });
    }
});

module.exports = router;
