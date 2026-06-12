const mongoose = require('mongoose');
const config = require('./env');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

/**
 * Connect to MongoDB with retry logic.
 */
const connectDB = async () => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(config.MONGODB_URI, {
        autoIndex: true,
      });

      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      break;
    } catch (error) {
      retries += 1;
      console.error(
        `❌ MongoDB connection failed (attempt ${retries}/${MAX_RETRIES}): ${error.message}`
      );

      if (retries >= MAX_RETRIES) {
        console.error('❌ Max retries reached. Exiting...');
        process.exit(1);
      }

      console.log(`   Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  // Connection event listeners
  mongoose.connection.on('connected', () => {
    console.log('📦 Mongoose connected to DB');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`📦 Mongoose connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('📦 Mongoose disconnected from DB');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('📦 Mongoose connection closed due to app termination');
    process.exit(0);
  });
};

module.exports = connectDB;
