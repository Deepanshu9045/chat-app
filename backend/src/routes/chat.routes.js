const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
} = require('../controllers/chat.controller');

const router = express.Router();

router.route('/').get(protect, fetchChats);
router.route('/private').post(protect, accessChat);
router.route('/group').post(protect, createGroupChat);
router.route('/group/:chatId').put(protect, renameGroup);
router.route('/group/:chatId/member').put(protect, addToGroup);
router.route('/group/:chatId/member/:userId').delete(protect, removeFromGroup);

module.exports = router;
