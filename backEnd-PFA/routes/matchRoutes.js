const express = require('express');
const router = express.Router();
const {
    getMatchs,
    getMatchById,
    createMatch,
    updateMatch,
    deleteMatch
} = require('../controllers/matchController');

// For now, these are public, but you might want to protect POST/PUT/DELETE
router.route('/').get(getMatchs).post(createMatch);
router.route('/:id').get(getMatchById).put(updateMatch).delete(deleteMatch);

module.exports = router;
