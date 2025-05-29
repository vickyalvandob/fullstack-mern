const Task = require('../models/Task');
const User = require('../models/User');
const excelJS = require('exceljs');

const exportTasksReport = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'name email').populate('createdBy', 'name email');
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tasks Report');
    
    worksheet.columns = [
      { header: 'Task ID', key: '_id', width: 25 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 20 },
      { header: 'Assigned To', key: 'assignedTo', width: 30 },
    ];

    tasks.forEach(task => {
      const assignedTo = task.assignedTo
      .map((user) => `${user.name} (${user.email})`)
      .join(', ');
      worksheet.addRow({
        _id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
        assignedTo: assignedTo || 'Unassigned',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks_report.xlsx');

    return workbook.xlsx.write(res)
      .then(() => {
        res.status(200).end();
      });
  } catch (error) {
    console.error('Error exporting tasks report:', error);
    res.status(500).json({ message: 'Failed to export tasks report' });
  }
};

const exportUsersReport = async (req, res) => {
  try {
    const users = await User.find().select('name email _id').lean();
    const userTasks = await Task.find().populate(
      'assignedTo', 
      'name email'
    );

    const userTaskMap = {};
    users.forEach(user => {
      userTaskMap[user._id] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        todoTasks: 0,
        inProgressTasks: 0,
        doneTasks: 0,
      };
    });

    userTasks.forEach((task) => {
      if (task.assignedTo) {
        task.assignedTo.forEach((assignedTo) => {
          if (userTaskMap[assignedTo._id]) {
            userTaskMap[assignedTo._id].taskCount += 1;
            if (task.status === 'todo') {
              userTaskMap[assignedTo._id].todoTasks += 1;
            } else if (task.status === 'in-progress') {
              userTaskMap[assignedTo._id].inProgressTasks += 1;
            } else if (task.status === 'done') {
              userTaskMap[assignedTo._id].doneTasks += 1;
            }
          }
        });
      }
    });

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users Report');
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Total Assigned Tasks', key: 'taskCount', width: 20 },
      { header: 'Todo Tasks', key: 'todoTasks', width: 20 },
      { header: 'In Progress Tasks', key: 'inProgressTasks', width: 20 },
      { header: 'Done Tasks', key: 'doneTasks', width: 20 },
    ];

    Object.values(userTaskMap).forEach(user => {
      worksheet.addRow(user);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users_report.xlsx');

    return workbook.xlsx.write(res)
      .then(() => {
        res.status(200).end();
      });
      
    } catch (error) {
    console.error('Error exporting tasks report:', error);
    res.status(500).json({ message: 'Failed to export tasks report' });
  }
}

module.exports = {
  exportTasksReport,
  exportUsersReport,
};