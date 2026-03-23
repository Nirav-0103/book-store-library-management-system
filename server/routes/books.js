const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect, staffOnly } = require('../middleware/auth');

// GET category counts (public)
router.get('/category-counts', async (req, res) => {
  try {
    const counts = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, available: { $sum: '$availableCopies' } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: counts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all books with search & filter (public)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { isbn: { $regex: search, $options: 'i' } }
    ];
    if (category && category !== 'All') query.category = category;
    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: books, count: books.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single book (public)
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create book (staff only)
router.post('/', protect, staffOnly, async (req, res) => {
  try {
    const book = new Book(req.body);
    book.availableCopies = book.totalCopies;
    await book.save();
    res.status(201).json({ success: true, data: book, message: 'Book added!' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'ISBN already exists' });
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update book (staff only)
router.put('/:id', protect, staffOnly, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book, message: 'Book updated!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE book (staff only)
router.delete('/:id', protect, staffOnly, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.availableCopies < book.totalCopies) {
      return res.status(400).json({ success: false, message: 'Cannot delete: book has active issues' });
    }
    await Book.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Book deleted!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;