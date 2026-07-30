const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    category: {
      type: String,
      trim: true,
      default: 'Work'
    },
    dueDate: {
      type: Date
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index for fast searching by user and filtering
taskSchema.index({ user: 1, status: 1, priority: 1 });

module.exports = mongoose.model('Task', taskSchema);
