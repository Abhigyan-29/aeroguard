const express = require('express');
const router = express.Router();
const { register, login, getMe, updateWatchlist } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/watchlist', auth, updateWatchlist);

module.exports = router;
