const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const COOKIE_NAME = process.env.COOKIE_NAME || "jwt";
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true only in production with https
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
};


const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email
});

const signAndSetCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, COOKIE_CONFIG);
  return token;
};


// Registration logic for authController.js
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Set auth cookie
    signAndSetCookie(res, newUser._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: formatUser(newUser)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    signAndSetCookie(res, user._id);

    res.json({
      message: 'Logged in successfully',
      user: formatUser(user)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, COOKIE_CONFIG);
  res.json({ message: 'Logged out' });
};

exports.currentUser = async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: formatUser(user) });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Return current logged in user
exports.getMe = (req, res) => {
  // auth middleware should have set req.user
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  res.json({ user: req.user });
};
