const Task = require('../models/Task');


const getDashboardData = async (req, res) => {
  try {
    // 1) Base counts
    const totalTasks      = await Task.countDocuments();
    const todoTasks       = await Task.countDocuments({ status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    const doneTasks       = await Task.countDocuments({ status: 'done' });
    const overdueTasks    = await Task.countDocuments({
      dueDate:  { $lt: new Date() },
      status:   { $ne: 'done' }
    });

    // 2) Task distribution by status
    const taskStatuses = ['todo','in-progress','done'];
    const taskDistributionRaw = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const found = taskDistributionRaw.find(item => item._id === status);
      acc[status] = found ? found.count : 0;
      return acc;
    }, {});
    taskDistribution.All = totalTasks;

    // 3) Task distribution by priority
    const priorityLevels = ['low','medium','high'];
    const priorityRaw = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    const taskPriorityLevels = priorityLevels.reduce((acc, p) => {
      const found = priorityRaw.find(item => item._id === p);
      acc[p] = found ? found.count : 0;
      return acc;
    }, {});

    // 4) Recent 10 tasks
    const recentTasks = await Task.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title status priority dueDate createdAt');

    // 5) Return
    return res.status(200).json({
      statistics: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks
      },
      charts: {
        taskDistribution,
        taskPriorityLevels
      },
      recentTasks
    });

  } catch (error) {
    console.error('getDashboardData error:', error);
    return res
      .status(500)
      .json({ message: 'Error fetching tasks', error: error.message });
  }
}

const getUserDashboardData = async (req, res) => {
  try {
    
    const userId = req.user._id; // Get the authenticated user's ID

    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const todoTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'todo'
    });
    const inProgressTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'in-progress'
    });
    const doneTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'done'
    });
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    });

    // Task distribution by status
    const taskStatuses = ['todo', 'in-progress', 'done'];
    const taskDistributionRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const found = taskDistributionRaw.find(item => item._id === status);
      acc[status] = found ? found.count : 0;
      return acc;
    }, {});
    taskDistribution.All = totalTasks;

    // Task distribution by priority
    const priorityLevels = ['low', 'medium', 'high'];
    const priorityRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    const taskPriorityLevels = priorityLevels.reduce((acc, p) => {
      const found = priorityRaw.find(item => item._id === p);
      acc[p] = found ? found.count : 0;
      return acc;
    }, {});
    
    // Recent 10 tasks
    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title status priority dueDate createdAt');

    res.status(200).json({
      statistics: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks
      },
      charts: {
        taskDistribution,
        taskPriorityLevels
      },
      recentTasks
    });

    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
}
    
// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const {status } = req.query; // Get status from query params
    let filter = {};
    if (status) {
      filter.status = status; // Filter by status if provided
    }

    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find(filter).populate(
        'assignedTo', 
        'name email profileImageUrl'
      );
    }else {
      tasks = await Task.find({
        ...filter,
        assignedTo: req.user._id // Only get tasks assigned to the authenticated user
      }).populate(
        'assignedTo', 
        'name email profileImageUrl'

      );
    }

    // add completed todo checklist count to each task
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedChecklistCount = task.todoChecklist.filter(item => item.done).length;
        return {
          ...task._doc,
          completedChecklistCount
        };
      })
    );

    const allTasks = await Task.countDocuments(
      req.user.role === 'admin' ? {} : { assignedTo: req.user._id }
    );

    const todoTasks = await Task.countDocuments({
      ...filter,
      status: 'todo',
      ...(req.user.role === 'admin' ? {} : { assignedTo: req.user._id })
    });

    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: 'in-progress',
      ...(req.user.role === 'admin' ? {} : { assignedTo: req.user._id })
    });

    const doneTasks = await Task.countDocuments({
      ...filter,
      status: 'done',
      ...(req.user.role === 'admin' ? {} : { assignedTo: req.user._id })
    });

    res.status(200).json({
      tasks,
     statusSumary: {
        all: allTasks,
        todoTasks,
        inProgressTasks,
        doneTasks
      },
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
}


// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id).populate(
      'assignedTo', 
      'name email profileImageUrl'
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
}

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  
  try {
    const { title, description, priority, status, dueDate, assignedTo, attachments, todoChecklist } = req.body;

    if(!Array.isArray(assignedTo)) {
      return res
      .status(400)
      .json({ message: 'AssignedTo must be an array of user IDs' });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
      createdBy: req.user._id, // Assuming req.user contains the authenticated user's info
      todoChecklist,
      attachments,
    });

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
}

// @desc    Update task by ID
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // Update fields
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.attachments = req.body.attachments || task.attachments;
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist;

    if(req.body.assignedTo) {
      if(!Array.isArray(req.body.assignedTo)) {
        return res
          .status(400)
          .json({ message: 'AssignedTo must be an array of user IDs' });
      }
      task.assignedTo = req.body.assignedTo; // Update assignedTo
    }

    const updatedTask = await task.save();
    res.status(200).json({ message: 'Task updated successfully', updatedTask });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
}

// @desc    Delete task by ID
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
}

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    // 1. Cari task
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 2. Normalize assignedTo jadi array
    //    (jika schema-mu single ObjectId, ini akan paksa jadi [thatId])
    const assignedList = Array.isArray(task.assignedTo)
      ? task.assignedTo
      : (task.assignedTo ? [task.assignedTo] : []);

    // 3. Cek apakah current user ada di assignedList atau dia admin
    const isAssigned = assignedList.some(u => u.toString() === req.user._id.toString());
    if (!isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 4. Update status
    const newStatus = req.body.status;
    if (newStatus) {
      task.status = newStatus;
    }

    // 5. Jika status = Completed, tandai semua checklist selesai
    if (task.status.toLowerCase() === 'done') {
      task.todoChecklist.forEach(item => item.done = true);
      task.progress = 100;
    }

    // 6. Simpan dan kembalikan hasil
    await task.save();
    return res.json({
      message: 'Task status updated',
      task
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Server error updating status',
      error: err.message
    });
  }
};


// @desc    Update task checklist
// @route   PUT /api/tasks/:id/todo
// @access  Private
const updateTaskChecklist = async (req, res) => {
  try {
    const { todoChecklist } = req.body;

    // 1. Fetch task
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 2. Normalize assignedTo jadi array
    const assignedList = Array.isArray(task.assignedTo)
      ? task.assignedTo
      : task.assignedTo
        ? [task.assignedTo]
        : [];

    // 3. Cek permission: hanya admin atau assigned user
    const userIdStr = req.user._id.toString();
    const isAssigned = assignedList.some(
      u => u.toString() === userIdStr
    );
    if (!isAssigned && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this task' });
    }

    // 4. Validasi input checklist
    if (!Array.isArray(todoChecklist)) {
      return res
        .status(400)
        .json({ message: 'todoChecklist must be an array' });
    }

    // 5. Replace checklist & recalc progress
    task.todoChecklist = todoChecklist;
    const doneCount  = task.todoChecklist.filter(i => i.done).length;
    const totalItems = task.todoChecklist.length;
    task.progress = totalItems > 0
      ? Math.round((doneCount / totalItems) * 100)
      : 0;

    // 6. Auto‐set status berdasarkan progress
    if (task.progress === 100) {
      task.status = 'done';
    } else if (task.progress > 0) {
      task.status = 'in-progress';
    } else {
      task.status = 'todo';
    }

    // 7. Save & populate assignedTo before returning
    await task.save();
    const updated = await Task.findById(task._id)
      .populate('assignedTo', 'name email profileImageUrl');

    return res.status(200).json({
      message: 'Task checklist updated successfully',
      task: updated
    });

  } catch (error) {
    console.error('Error in updateTaskChecklist:', error);
    return res.status(500).json({
      message: 'Error updating task checklist',
      error: error.message
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData
};

// Note: The above code assumes that the Task model is already defined and imported correctly.
// The code also assumes that the user is authenticated and req.user contains the authenticated user's information.