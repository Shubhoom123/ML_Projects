const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { paginationValidation, shaValidation } = require('../middleware/validation');

// Get recent commits - with validation
router.get('/', paginationValidation, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        const result = await pool.query(`
            SELECT c.*, co.username, co.avatar_url
            FROM commits c
            LEFT JOIN contributors co ON c.author_id = co.user_id
            ORDER BY c.commit_date DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
        
        const countResult = await pool.query('SELECT COUNT(*) FROM commits');
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
        console.error('Error fetching commits:', error);
        res.status(500).json({ error: 'Failed to fetch commits' });
    }
});

// Get commit by SHA - with validation
router.get('/:sha', shaValidation, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, co.username, co.avatar_url
            FROM commits c
            LEFT JOIN contributors co ON c.author_id = co.user_id
            WHERE c.sha = $1
        `, [req.params.sha]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Commit not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching commit:', error);
        res.status(500).json({ error: 'Failed to fetch commit' });
    }
});

module.exports = router;
