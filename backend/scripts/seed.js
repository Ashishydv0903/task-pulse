const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Task = require('../models/Task');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('[SEED] Cleaning existing database collection...');
    await User.deleteMany();
    await Task.deleteMany();

    console.log('[SEED] Creating Demo User...');
    const demoUser = await User.create({
      name: 'Alex Rivera',
      email: 'demo@example.com',
      password: 'password123',
      role: 'user'
    });

    console.log(`[SEED] Created Demo User: ${demoUser.email} (ID: ${demoUser._id})`);

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const sampleTasks = [
      {
        title: 'Design RESTful API Schema & Auth Routes',
        description: 'Complete MongoDB Mongoose schema design for users and tasks, plus Express JWT auth middleware.',
        status: 'completed',
        priority: 'high',
        category: 'Development',
        dueDate: yesterday,
        user: demoUser._id
      },
      {
        title: 'Review System Architecture with Team',
        description: 'Discuss MVC separation of concerns, controllers, routes, and security practices.',
        status: 'in_progress',
        priority: 'high',
        category: 'Meetings',
        dueDate: tomorrow,
        user: demoUser._id
      },
      {
        title: 'Implement Dark & Light Glassmorphic Theme',
        description: 'Design dynamic CSS variables, smooth animations, and high-aesthetic UI dashboard components.',
        status: 'in_progress',
        priority: 'medium',
        category: 'Design',
        dueDate: tomorrow,
        user: demoUser._id
      },
      {
        title: 'Write API Documentation & Postman Guide',
        description: 'Detail register, login, task CRUD operations, headers, and request/response examples in README.md.',
        status: 'pending',
        priority: 'medium',
        category: 'Documentation',
        dueDate: nextWeek,
        user: demoUser._id
      },
      {
        title: 'Perform Security Audit on Passwords & Tokens',
        description: 'Ensure bcrypt salt rounds are adequate and JWT secret key configuration is secure.',
        status: 'pending',
        priority: 'high',
        category: 'Security',
        dueDate: nextWeek,
        user: demoUser._id
      }
    ];

    await Task.insertMany(sampleTasks);
    console.log(`[SEED] Successfully seeded ${sampleTasks.length} sample tasks!`);

    process.exit(0);
  } catch (error) {
    console.error(`[SEED] Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
