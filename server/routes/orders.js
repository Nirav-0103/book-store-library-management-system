const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Book = require('../models/Book');
const { protect, adminOnly } = require('../middleware/auth');

// ── USER: Create Order ──
router.post('/', protect, async (req, res) => {
  try {
    const { items, paymentMethod, deliveryAddress, totalAmount } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: 'No items in order' });

    // ✅ FIXED: Stock check + decrement on order place
    for (const item of items) {
      const book = await Book.findById(item.book);
      if (!book)
        return res.status(404).json({ success: false, message: `Book not found: ${item.title}` });
      if (book.availableCopies < (item.quantity || 1)) {
        return res.status(400).json({
          success: false,
          message: `"${book.title}" na sufficient copies nathi`,
        });
      }
      await Book.findByIdAndUpdate(item.book, {
        $inc: { availableCopies: -(item.quantity || 1) },
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' || paymentMethod === 'cod' ? 'pending' : 'paid',
      deliveryAddress,
    });

    res.status(201).json({ success: true, data: order, message: 'Order placed successfully!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── USER: Get My Orders ──
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.book', 'title author coverImage')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── USER: Cancel Request ──
router.put('/:id/cancel-request', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['placed', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this order at this stage' });
    }

    order.orderStatus = 'cancel_requested';
    order.cancelReason = req.body.reason || 'Requested by user';
    order.cancelRequestedAt = new Date();
    await order.save();

    // ✅ FIXED: Stock restore immediately when user requests cancel
    for (const item of order.items) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { availableCopies: item.quantity || 1 },
      });
    }

    res.json({ success: true, data: order, message: 'Cancel request sent to admin!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN: Get All Orders ──
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'all') query.orderStatus = status;
    const orders = await Order.find(query)
      .populate('user', 'name email membershipId')
      .populate('items.book', 'title author coverImage')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders, count: orders.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN: Update Order Status ──
router.put('/admin/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = status;
    if (adminNote) order.adminNote = adminNote;

    if (status === 'confirmed') order.confirmedAt = new Date();
    if (status === 'completed') order.completedAt = new Date();
    if (status === 'cancelled') {
      order.cancelledAt = new Date();
      // Restore book copies only if cancel_requested nahi hoy
      // (cancel_requested ma already restore thai gayu chhe)
      if (order.orderStatus !== 'cancel_requested') {
        for (const item of order.items) {
          await Book.findByIdAndUpdate(item.book, {
            $inc: { availableCopies: item.quantity || 1 },
          });
        }
      }
    }
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('user', 'name email membershipId')
      .populate('items.book', 'title author');

    res.json({ success: true, data: populated, message: `Order ${status}!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN: Get Stats ──
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  try {
    const total = await Order.countDocuments();
    const placed = await Order.countDocuments({ orderStatus: 'placed' });
    const confirmed = await Order.countDocuments({ orderStatus: 'confirmed' });
    const completed = await Order.countDocuments({ orderStatus: 'completed' });
    const cancelled = await Order.countDocuments({ orderStatus: 'cancelled' });
    const cancelRequested = await Order.countDocuments({ orderStatus: 'cancel_requested' });
    const revenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    res.json({
      success: true,
      data: { total, placed, confirmed, completed, cancelled, cancelRequested, revenue: revenue[0]?.total || 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;