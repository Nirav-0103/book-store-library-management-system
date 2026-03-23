const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, phone, role: 'member' });
    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, membershipId: user.membershipId }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    user.lastLogin = new Date();
    await user.save();
    const token = signToken(user._id);
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, membershipId: user.membershipId, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true }).select('-password');
    res.json({ success: true, user, message: 'Profile updated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Old password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

// GET saved addresses
router.get('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('savedAddresses');
    res.json({ success: true, data: user.savedAddresses || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST save address
router.post('/addresses', protect, async (req, res) => {
  try {
    const { label, fullName, phone, street, city, state, pincode, isDefault } = req.body;
    const user = await User.findById(req.user._id);
    
    // If default, unset other defaults
    if (isDefault) {
      user.savedAddresses.forEach(a => a.isDefault = false);
    }
    
    user.savedAddresses.push({ label, fullName, phone, street, city, state, pincode, isDefault: isDefault || false });
    await user.save();
    res.json({ success: true, data: user.savedAddresses, message: 'Address saved!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE address
router.delete('/addresses/:idx', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedAddresses.splice(req.params.idx, 1);
    await user.save();
    res.json({ success: true, message: 'Address removed!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});