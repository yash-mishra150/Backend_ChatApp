const express = require('express');
const router = express.Router();
const { CreateNewUser, LoginUser } = require('../controllers/HandleLoginController');
const rateLimit = require('express-rate-limit');
const { check, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const passwordResetController = require('../controllers/PasswordChangeController');

// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after some time'
});

// Validation middlewares
const validateUser = [
    check('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name cannot contain numbers or special characters'),
    check('email')
        .isEmail()
        .withMessage('Invalid email address'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
    check('email')
        .isEmail()
        .withMessage('Invalid email address'),
    check('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Handle validation errors middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Routes
router.post('/register', limiter, validateUser, handleValidationErrors, CreateNewUser);
router.post('/login', limiter, validateLogin, handleValidationErrors, LoginUser);
router.post('/request-reset',limiter, passwordResetController.requestPasswordReset);
router.post('/verify-otp',limiter, passwordResetController.verifyOtp);
router.post('/reset-password',limiter, passwordResetController.resetPassword);
router.post('/private', limiter, authMiddleware, (req, res) => { //authenticated route only can be accessed through token and token
    res.send('This is an authenticated route.');
});

module.exports = router;