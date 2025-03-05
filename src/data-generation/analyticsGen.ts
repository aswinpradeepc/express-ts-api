import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { format } from 'date-fns';
import AnalyticsData from '../models/AnalyticsData';

const DAYS = 60; // Number of days to generate data for
const START_HOUR = 8; // Start hour for data generation (8 AM)
const END_HOUR = 22; // End hour for data generation (10 PM)
const ANALYTICS_DIR = path.join(__dirname, 'analytics'); // Directory to store JSON files
const BATCH_SIZE = 100; // Batch insert size

// Create the analytics directory if it doesn't exist
if (!fs.existsSync(ANALYTICS_DIR)) {
  fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
}

// Generate analytics data with random triggers (80–160 seconds)
const generateAnalyticsData = async () => {
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS); // Set the start date to DAYS ago

  for (let i = 0; i < DAYS; i++) {
    const day = new Date(startDate);
    const formattedDate = format(day, 'yyyy-MM-dd'); // Format the date for the filename
    startDate = new Date(startDate.getTime() + 86400000); // Increment the start date by 1 day
    const analyticsData = [];
    let batch = []; // Batch storage for inserts
    let currentTime = new Date(day);
    currentTime.setHours(START_HOUR, 0, 0, 0); // Set the start time for the day
    const endTime = new Date(day);
    endTime.setHours(END_HOUR, 0, 0, 0); // Set the end time for the day

    while (currentTime < endTime) {
      // Simulate a trigger event
      const record = {
        timestamp: new Date(currentTime),
        metadata: {
          deviceId: 'device-123', // Static device ID
          data: Math.random() < 0.5 ? 0 : 1, // Random data (0 or 1)
          timestamp: currentTime.getTime(),
        },
      };

      analyticsData.push(record); // Store for file writing
      batch.push(record); // Store for batch insert

      // Perform batch insert when batch size reaches the limit
      if (batch.length >= BATCH_SIZE) {
        await AnalyticsData.insertMany(batch);
        batch = []; // Clear batch after insert
      }

      // Randomly increment the time by 80–160 seconds
      const randomSeconds = Math.floor(Math.random() * 61) + 60;
      currentTime.setSeconds(currentTime.getSeconds() + randomSeconds);
    }

    // Insert remaining records in the batch (if any)
    if (batch.length > 0) {
      await AnalyticsData.insertMany(batch);
    }

    // Write the generated data to a JSON file
    fs.writeFileSync(
      path.join(ANALYTICS_DIR, `${formattedDate}.json`),
      JSON.stringify(analyticsData, null, 2)
    );

    console.log(`Generated data for ${formattedDate}`);
  }
};

// Main function to run the data generation process
const runGeneration = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydb'; // MongoDB connection URI

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 20000,
      retryWrites: true,
      maxPoolSize: 10,
    });
    console.log('MongoDB Connected');

    // Generate analytics data
    await generateAnalyticsData();
    console.log('Data generation complete.');
  } catch (err) {
    console.error('MongoDB Connection or Data Generation Error:', err);
    process.exit(1); // Exit with an error code
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

// Run the script
runGeneration();
