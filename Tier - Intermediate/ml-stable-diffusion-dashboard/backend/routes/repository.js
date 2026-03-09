const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get repository information
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM repositories ORDER BY last_synced DESC LIMIT 1'
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Repository not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching repository:', error);
        res.status(500).json({ error: 'Failed to fetch repository data' });
    }
});

module.exports = router;
