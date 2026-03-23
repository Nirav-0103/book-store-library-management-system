const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'librarian', 'member'], default: 'member' },
  phone: { type: String, trim: true },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  membershipId: { type: String, unique: true, sparse: true },
  lastLogin: { type: Date },
  savedAddresses: [{
    label: { type: String, default: 'Home' },
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: { type: Boolean, default: false }
  }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.role === 'member' && !this.membershipId) {
    const count = await mongoose.model('User').countDocuments({ role: 'member' });
    this.membershipId = `LIB${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);