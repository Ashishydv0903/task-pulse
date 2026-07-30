const Task = require('../models/Task');

// @desc    Get all tasks for logged in user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { search, status, priority, category, sort } = req.query;

    const query = { user: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'dueDate') {
      sortOption = { dueDate: 1 };
    } else if (sort === 'priority') {
      sortOption = { priority: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const tasks = await Task.find(query).sort(sortOption);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure task belongs to user
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this task' });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      category: category || 'Work',
      dueDate: dueDate || null,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check ownership
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    const { title, description, status, priority, category, dueDate } = req.body;

    task.title = title !== undefined ? title : task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status !== undefined ? status : task.status;
    task.priority = priority !== undefined ? priority : task.priority;
    task.category = category !== undefined ? category : task.category;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;

    const updatedTask = await task.save();

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check ownership
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task removed successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics & stats for user
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const total = await Task.countDocuments({ user: userId });
    const pending = await Task.countDocuments({ user: userId, status: 'pending' });
    const inProgress = await Task.countDocuments({ user: userId, status: 'in_progress' });
    const completed = await Task.countDocuments({ user: userId, status: 'completed' });
    const highPriority = await Task.countDocuments({ user: userId, priority: 'high' });
    
    const now = new Date();
    const overdue = await Task.countDocuments({
      user: userId,
      status: { $ne: 'completed' },
      dueDate: { $lt: now }
    });

    const categories = await Task.distinct('category', { user: userId });

    res.json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        completed,
        highPriority,
        overdue,
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};
