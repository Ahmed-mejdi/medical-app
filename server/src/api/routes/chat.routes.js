const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authJwt = require('../middlewares/auth.middleware');

// @route   GET api/chat/conversations
// @desc    Get all of a user's conversations
// @access  Private
router.get('/conversations', authJwt.verifyToken, chatController.getConversations);

// @route   GET api/chat/conversations/:id
// @desc    Get all messages for a conversation
// @access  Private
router.get('/conversations/:conversationId', authJwt.verifyToken, chatController.getMessages);

// @route   POST api/chat/conversations
// @desc    Create a new conversation
// @access  Private
router.post('/conversations', authJwt.verifyToken, chatController.createConversation);

// @route   PATCH api/chat/conversations/:id/archive
// @desc    Archive a conversation
// @access  Private
router.patch('/conversations/:id/archive', authJwt.verifyToken, chatController.archiveConversation);

module.exports = router; 