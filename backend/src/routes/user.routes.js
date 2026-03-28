const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { allUsers, updateUserProfile } = require('../controllers/user.controller');

const router = express.Router();

router.route('/').get(protect, allUsers);
router.route('/profile').put(protect, updateUserProfile);

module.exports = router;
