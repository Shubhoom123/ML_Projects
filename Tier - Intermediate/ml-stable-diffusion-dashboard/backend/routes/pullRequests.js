const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all pull requests
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const state = req.query.state || 'all';
        
        let query = `
            SELECT pr.*, co.username, co.avatar_url
            FROM pull_requests pr
            LEFT JOIN contributors co ON pr.author_id = co.user_id
        `;
        
        const params = [limit, offset];
        
        if (state !== 'all') {
            query += ' WHERE pr.state = $3';
            params.push(state);
        }
        
        query += ' ORDER BY pr.created_at DESC LIMIT $1 OFFSET $2';
        
        const result = await pool.query(query, params);
        
        const countQuery = state !== 'all' 
            ? 'SELECT COUNT(*) FROM pull_requests WHERE state = $1'
            : 'SELECT COUNT(*) FROM pull_requests';
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
        console.error('Error fetching pull requests:', error);
        res.status(500).json({ error: 'Failed to fetch pull requests' });
    }
});

// Get PR by number
router.get('/:number', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT pr.*, co.username, co.avatar_url
            FROM pull_requests pr
            LEFT JOIN contributors co ON pr.author_id = co.user_id
            WHERE pr.pr_number = $1
        `, [req.params.number]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pull request not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching pull request:', error);
        res.status(500).json({ error: 'Failed to fetch pull request' });
    }
});

module.exports = router;
