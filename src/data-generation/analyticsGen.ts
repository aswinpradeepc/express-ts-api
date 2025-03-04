import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { format } from 'date-fns';
import AnalyticsData from '../models/AnalyticsData';

const DAYS = 60; // Number of days to generate data for
const START_HOUR = 8; // Start hour for data generation (8 AM)
const END_HOUR = 22; // End hour for data generation (10 PM)
const ANALYTICS_DIR = path.join(__dirname, 'analytics'); // Directory to store JSON files

// Create the analytics directory if it doesn't exist
if (!fs.existsSync(ANALYTICS_DIR)) {
  fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
}

// Safely drop a MongoDB collection
const safeDropCollection = async (model: mongoose.Model<any>) => {
  try {
    await model.collection.drop();
    console.log(`Dropped collection: ${model.collection.name}`);
  } catch (err: any) {
    if (err.code === 26 || err.message.includes('ns not found')) {
      console.log(`Collection ${model.collection.name} does not exist`);
    } else if (err.message.includes('a view')) {
      console.log(`Attempting to remove view: ${model.collection.name}`);
      // Use raw MongoDB driver to drop a view
      await mongoose.connection.db?.dropCollection(model.collection.name);
    } else {
      console.error(`Error dropping collection ${model.collection.name}:`, err);
    }
  }
};

// Create a time-series collection in MongoDB
const createTimeSeriesCollection = async () => {
  try {
    await mongoose.connection.db?.createCollection('analyticsdata', {
      timeseries: {
        timeField: 'timestamp', // Field containing the timestamp
        metaField: 'metadata', // Field containing metadata (e.g., deviceId)
        granularity: 'minutes', // Granularity of the time-series data
      },
    });
    console.log('Time-series collection created.');
  } catch (err) {
    console.error('Error creating time-series collection:', err);
  }
};

// Generate analytics data with random triggers (80–160 seconds)
const generateAnalyticsData = async () => {
  // Ensure the collection is dropped before generating new data
  await safeDropCollection(AnalyticsData);

  // Create a time-series collection
  await createTimeSeriesCollection();

  let startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS); // Set the start date to DAYS ago

  for (let i = 0; i < DAYS; i++) {
    const day = new Date(startDate);
    const formattedDate = format(day, 'yyyy-MM-dd'); // Format the date for the filename
    startDate = new Date(startDate.getTime() + 86400000); // Increment the date by one day
    const analyticsData = [];
    let currentTime = new Date(day);
    currentTime.setHours(START_HOUR, 0, 0, 0); // Set the start time for the day
    const endTime = new Date(day);
    endTime.setHours(END_HOUR, 0, 0, 0); // Set the end time for the day

    while (currentTime < endTime) {
      // Simulate a trigger event
      analyticsData.push({
        timestamp: currentTime,
        metadata: {
          deviceId: 'device-123', // Static device ID
          data: Math.random() < 0.5 ? 0 : 1, // Random data (0 or 1)
                    timestamp: currentTime.getTime(), 
        },
      });

      // Randomly increment the time by 80–160 seconds
    const randomSeconds = Math.floor(Math.random() * 61) + 60; // Randomly choose between 60 and 120 seconds
    currentTime.setSeconds(currentTime.getSeconds() + randomSeconds);
    }

    // Write the generated data to a JSON file
    fs.writeFileSync(
      path.join(ANALYTICS_DIR, `${formattedDate}.json`),
      JSON.stringify(analyticsData, null, 2)
    );

    // Insert the generated data into the MongoDB collection
    await AnalyticsData.insertMany(analyticsData);
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