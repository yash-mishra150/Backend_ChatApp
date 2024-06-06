const User = require('../models/userScheme');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const asyncHandler = require("express-async-handler");
const { generateToken } = require('../utils/jwt');
// const { v4: uuidv4 } = require('uuid');

const CreateNewUser = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.query;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please add all fields");
    }


    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }



    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        msg: `Created new user ${user.name}`,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
  }

  if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages });
  }

  console.error('Error creating user:', error);
  res.status(500).json({ error: 'Internal Server Error' });
  }
});

const LoginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.query;

  if (!email || !password) {
    res.status(400).json({ error: "Please provide both email and password" });
    return; 
  }

  try {
   
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ error: "User not found" });
      return; 
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.json({
        msg: 'Login Successful',
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports = { CreateNewUser, LoginUser };
