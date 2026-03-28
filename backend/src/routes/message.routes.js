const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  allMessages,
  sendMessage,
  markAsSeen,
  uploadFile,
} = require('../controllers/message.controller');

const router = express.Router();

router.route('/:chatId').get(protect, allMessages);
router.route('/').post(protect, sendMessage);
router.route('/:messageId/seen').put(protect, markAsSeen);
router.route('/upload').post(protect, upload.single('file'), uploadFile);

module.exports = router;
