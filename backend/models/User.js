const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Name is required
  },
  email: {
    type: String, 
    required: true,
    unique: true, // Email must be unique
  },
  password: {
    type: String,
    required: true, // Password is required
  },
  perofileImageUrl: {
    type: String,
    default: null, // Default to null if no image is provided
  },
  role: {
    type: String,
    enum: ['admin', 'member'], // Role can be either 'admin' or 'member'
    default: 'member', // Default role is 'member'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

