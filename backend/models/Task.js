const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true, // Title is required  
  },
  done: {
    type: Boolean,
    default: false, // Default to false if not specified
  },
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title is required  
  },
  description: {
    type: String,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'], // Priority can be either 'low', 'medium', or 'high'
    default: 'medium', // Default priority is 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'], // Status can be either 'todo', 'in-progress', or 'done'
    default: 'todo', // Default status is 'todo'
  },
  dueDate: {
    type: Date,
    required: true, // Due date is optional
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  },
  attachments: [{
    type: String, // Array of attachment URLs
    required: false, // Attachments are optional
  }],
  todoChecklist: [todoSchema],
  progress: {
    type: Number,
    default: 0, // Default progress is 0%
  }
}, { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
