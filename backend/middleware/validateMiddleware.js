const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  next();
};

const validateTask = (req, res, next) => {
  // If creating a task (POST), title is required
  if (req.method === 'POST') {
    if (!req.body.title || req.body.title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }
  }

  // If title is provided on PUT, ensure it is non-empty
  if (req.body.title !== undefined && req.body.title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Task title cannot be empty' });
  }

  if (req.body.status && !['pending', 'in_progress', 'completed'].includes(req.body.status)) {
    return res.status(400).json({ success: false, message: 'Invalid task status' });
  }

  if (req.body.priority && !['low', 'medium', 'high'].includes(req.body.priority)) {
    return res.status(400).json({ success: false, message: 'Invalid task priority' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTask
};
