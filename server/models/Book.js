const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, required: true, unique: true, trim: true },
  category: {
    type: String, required: true,
    enum: ['Science', 'Technology', 'History', 'Literature', 'Philosophy', 'Biography'],
    default: 'Science'
  },
  price: { type: Number, default: 0, min: 0 }, // ← NEW: borrow fee / purchase price
  totalCopies: { type: Number, required: true, min: 1, default: 1 },
  availableCopies: { type: Number, default: 1 },
  publisher: { type: String, trim: true },
  publishedYear: { type: Number },
  description: { type: String, trim: true },
  coverImage: { type: String, default: '' },
  extraImages: [{ type: String }],
  language: { type: String, default: 'English' },
  pages: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);