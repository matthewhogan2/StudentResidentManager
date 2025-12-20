//route handling user authentication

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { register, login, getMe, logout } = require('../controllers/authController');


router.post('/register', register);
router.post('/login', login);

// must be logged in
router.get('/me', auth, getMe);

// logout (no auth required, but it's fine if cookie missing)
router.post('/logout', logout);


module.exports = router;
