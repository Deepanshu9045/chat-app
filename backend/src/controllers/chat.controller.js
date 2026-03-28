const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Create or fetch One to One Chat
// @route   POST /api/chats/private
// @access  Private
const accessChat = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send('UserId param not sent with request');
  }

  try {
    let isChat = await Chat.find({
      isGroup: false,
      $and: [
        { participants: { $elemMatch: { $eq: req.user._id } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('participants', '-password')
      .populate('latestMessage');

    isChat = await User.populate(isChat, {
      path: 'latestMessage.senderId',
      select: 'name profileImage email',
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: 'sender',
        isGroup: false,
        participants: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'participants',
        '-password'
      );
      res.status(200).json(FullChat);
    }
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chats
// @access  Private
const fetchChats = async (req, res, next) => {
  try {
    let results = await Chat.find({ participants: { $elemMatch: { $eq: req.user._id } } })
      .populate('participants', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    results = await User.populate(results, {
      path: 'latestMessage.senderId',
      select: 'name profileImage email',
    });

    res.status(200).send(results);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Create New Group Chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'Please Fill all the fields' });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send('More than 2 users are required to form a group chat');
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      participants: users,
      isGroup: true,
      groupAdmin: req.user,
      groupImage: req.body.groupImage || ''
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Rename Group
// @route   PUT /api/chats/group/:chatId
// @access  Private
const renameGroup = async (req, res, next) => {
  try {
    const { chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      { chatName: chatName },
      { new: true }
    )
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    if (!updatedChat) {
      res.status(404);
      throw new Error('Chat Not Found');
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove user from Group
// @route   DELETE /api/chats/group/:chatId/member/:userId
// @access  Private
const removeFromGroup = async (req, res, next) => {
  try {
    const { chatId, userId } = req.params;

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { participants: userId },
      },
      { new: true }
    )
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    if (!removed) {
      res.status(404);
      throw new Error('Chat Not Found');
    } else {
      res.json(removed);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add user to Group
// @route   PUT /api/chats/group/:chatId/member
// @access  Private
const addToGroup = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const { chatId } = req.params;

    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { participants: userId },
      },
      { new: true }
    )
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    if (!added) {
      res.status(404);
      throw new Error('Chat Not Found');
    } else {
      res.json(added);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};
