const Task = require('../models/Task');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({role: 'member'}).select('-password'); // Ambil semua user tanpa password
    
    // add task counts to each user
    const usersWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        
      // Hitung jumlah task berdasarkan status
      const todoTask = await Task.countDocuments({ 
        assignedTo: user._id, 
        status: 'todo' 
      });
      const inProgressTask = await Task.countDocuments({ 
        assignedTo: user._id, 
        status: 'in-progress' 
      });
      const doneTask = await Task.countDocuments({ 
        assignedTo: user._id, 
        status: 'done' 
      });
      
      return {
        ...user._doc,
        todoTask,
        inProgressTask,
        doneTask
      };
    }) 
  );
      
  res.status(200).json(usersWithTaskCounts);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select ('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  }
  catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
}
// @desc    Update user (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body; // Ambil nama, email, dan role dari body request
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    // Simpan perubahan
    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImageUrl: updatedUser.profileImageUrl,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
}

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Hapus user
    await user.remove();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
}

// Export all functions
module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
// This file contains the user management controller functions for handling user-related operations
// such as getting all users, getting a user by ID, updating a user, deleting a user, and changing a user's password.
// It uses the User model to interact with the database and handles errors appropriately.
