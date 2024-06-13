const express = require('express');
const router = express.Router();
const messageController = require('../controllers/MessagesHandleController');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/authMiddleware');

// Rate limiter configuration for message routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after some time'
});

router.get('/receive', limiter, authMiddleware, messageController.getAllMessages);
router.post('/sent', limiter, authMiddleware, messageController.createMessage);

module.exports = router;
