const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Member = require('../models/Member');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { protect, staffOnly } = require('../middleware/auth');

router.get('/stats', protect, staffOnly, async (req, res) => {
  try {
    const [totalBooks, totalMembers, totalUsers, activeIssues, overdueIssues, totalReturned, totalAvailable, recentIssues, categoryStats] = await Promise.all([
      Book.countDocuments(),
      Member.countDocuments(),
      User.countDocuments(),
      Issue.countDocuments({ status: { $in: ['issued', 'overdue'] } }),
      Issue.countDocuments({ status: 'overdue' }),
      Issue.countDocuments({ status: 'returned' }),
      Book.aggregate([{ $group: { _id: null, total: { $sum: '$availableCopies' } } }]),
      Issue.find({ status: { $in: ['issued', 'overdue'] } }).populate('book', 'title author').populate('member', 'name membershipId').sort({ createdAt: -1 }).limit(5),
      Book.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }])
    ]);
    res.json({
      success: true,
      data: { totalBooks, totalMembers, totalUsers, activeIssues, overdueIssues, totalReturned, availableCopies: totalAvailable[0]?.total || 0, recentIssues, categoryStats }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
