const schedule = require('node-schedule');
const Message = require('./models/messModel');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for cleanup');
  } catch (err) {
    console.error('MongoDB connection error for cleanup:', err);
  }
};

// Schedule job to delete messages older than 5 days, running every 5 days
const days = 5;
const cleanupInterval = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds

const cleanupJob = async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  try {
    await connectDB(); // Ensure we are connected to the database
    const result = await Message.deleteMany({ timestamp: { $lt: cutoffDate } });
    console.log(`Cleanup job completed. Deleted ${result.deletedCount} old messages.`);
    mongoose.connection.close(); // Close the connection after cleanup
  } catch (err) {
    console.error('Error during message cleanup:', err);
  }
};

// Schedule the cleanup job to run every 5 days
schedule.scheduleJob({ start: new Date(Date.now() + cleanupInterval), rule: `*/${cleanupInterval / 1000 / 60} * * * *` }, cleanupJob);
