const express = require('express');
const { adminOnly, protect } = require('../middlewares/authMiddleware');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// user management routes
router.get('/', protect, adminOnly, getUsers); // Get all users (admin only)
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id', protect, adminOnly, updateUser); // Update user (admin only)
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;