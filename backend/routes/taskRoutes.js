const express = require('express');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const {
  getDashboardData,
  getUserDashboardData,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
} = require('../controllers/taskController');

const router = express.Router();  

router.get('/dashboard-data',      protect, getDashboardData);
router.get('/user-dashboard-data', protect, getUserDashboardData);
router.get('/', protect, getTasks); // Get all tasks
router.get('/:id', protect, getTaskById); // Get task by ID
router.post('/', protect, adminOnly, createTask); // Create a new task
router.put('/:id', protect, updateTask); // Update task by ID
router.delete('/:id', protect, adminOnly, deleteTask); // Delete task by ID
router.put('/:id/status', protect, updateTaskStatus); // Update task status
router.put('/:id/todo', protect, updateTaskChecklist); // Update task checklist

module.exports = router;