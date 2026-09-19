const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager';
    
    // Attempt standard connection
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000 // Quick timeout to fallback if local mongo daemon is off
    });
    console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.log(`[DB] Standard MongoDB connection failed: ${err.message}`);
    console.log('[DB] Initializing MongoDB Memory Server fallback for instant zero-config setup...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[DB] Connected to MongoDB Memory Server at ${conn.connection.host}`);
    } catch (memErr) {
      console.error(`[DB] Memory Server connection failed: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
