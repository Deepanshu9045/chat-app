const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

// @desc    Get all Messages
// @route   GET /api/messages/:chatId
// @access  Private
const allMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('senderId', 'name profileImage email')
      .populate('chatId');
    res.json(messages);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Create New Message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  const { content, chatId, messageType, fileUrl, fileName } = req.body;

  if (!chatId || (!content && !fileUrl)) {
    return res.status(400).send('Invalid data passed into request');
  }

  var newMessage = {
    senderId: req.user._id,
    content: content || '',
    chatId: chatId,
    messageType: messageType || 'text',
    fileUrl: fileUrl || '',
    fileName: fileName || '',
    seenBy: [req.user._id],
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate('senderId', 'name profileImage');
    message = await message.populate('chatId');
    message = await User.populate(message, {
      path: 'chatId.participants',
      select: 'name profileImage email',
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Mark message as seen
// @route   PUT /api/messages/:messageId/seen
// @access  Private
const markAsSeen = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (message) {
      if (!message.seenBy.includes(req.user._id)) {
        message.seenBy.push(req.user._id);
        await message.save();
      }
      res.json(message);
    } else {
      res.status(404);
      throw new Error('Message not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Upload file for message
// @route   POST /api/messages/upload
// @access  Private
const uploadFile = async (req, res, next) => {
  try {
    if (req.file) {
      // Return file path
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ fileUrl, fileName: req.file.originalname });
    } else {
      res.status(400);
      throw new Error('No file uploaded');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { allMessages, sendMessage, markAsSeen, uploadFile };
