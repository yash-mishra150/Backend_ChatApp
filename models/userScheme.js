// models/userScheme.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const algorithm = 'aes-256-ctr';
const secretKey = process.env.SECRET_KEY || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4 
    },
    name: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(value) {
                return /^[a-zA-Z\s]+$/.test(value); // Regex to check that name contains only letters and spaces
            },
            message: 'Name cannot contain numbers or special characters'
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    }
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema);
