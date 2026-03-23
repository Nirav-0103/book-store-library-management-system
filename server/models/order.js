const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  title: { type: String, required: true },
  author: { type: String },
  coverImage: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['card', 'upi', 'cash', 'cod'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'ready', 'completed', 'cancel_requested', 'cancelled'],
    default: 'placed'
  },
  deliveryAddress: {
    fullName: String, phone: String, street: String,
    city: String, state: String, pincode: String
  },
  cancelReason: { type: String },
  cancelRequestedAt: { type: Date },
  cancelledAt: { type: Date },
  confirmedAt: { type: Date },
  completedAt: { type: Date },
  adminNote: { type: String },
}, { timestamps: true });

// Auto generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    this.orderNumber = `LIB-${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(4,'0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);