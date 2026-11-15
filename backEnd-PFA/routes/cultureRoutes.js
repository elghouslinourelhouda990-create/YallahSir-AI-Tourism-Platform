const express = require('express');
const router = express.Router();
const Culture = require('../models/cultureModel');

// @route   GET /api/culture
// @desc    Get all culture items
router.get('/', async (req, res) => {
    try {
        const cultureItems = await Culture.find({});
        res.json(cultureItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
