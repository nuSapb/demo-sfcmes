const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();

// POST /api/ai/chat - AI chat endpoint (public, no auth required)
router.post('/chat', aiController.chat);

module.exports = router;
