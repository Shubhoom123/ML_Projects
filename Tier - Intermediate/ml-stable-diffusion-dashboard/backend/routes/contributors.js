const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all contributors
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        const result = await pool.query(
            'SELECT * FROM contributors ORDER BY contributions DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        
        const countResult = await pool.query('SELECT COUNT(*) FROM contributors');
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
        console.error('Error fetching contributors:', error);
        res.status(500).json({ error: 'Failed to fetch contributors' });
    }
});

// Get top contributors
router.get('/top', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await pool.query(
            'SELECT * FROM contributors ORDER BY contributions DESC LIMIT $1',
            [limit]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching top contributors:', error);
        res.status(500).json({ error: 'Failed to fetch top contributors' });
    }
});

module.exports = router;
