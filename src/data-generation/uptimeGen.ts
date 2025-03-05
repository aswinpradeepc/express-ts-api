import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { format } from 'date-fns';
import UptimeData from '../models/UptimeData';

const DAYS = 60; // 2 months
const START_HOUR = 8;
const END_HOUR = 20; // 12 hours of uptime
const UPTIME_DIR = path.join(__dirname, 'uptime');
const BATCH_SIZE = 100; // Batch insert size

if (!fs.existsSync(UPTIME_DIR)) fs.mkdirSync(UPTIME_DIR, { recursive: true });

const generateUptimeData = async () => {
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS);

  for (let i = 0; i < DAYS; i++) {
    const day = new Date(startDate);
    const formattedDate = format(day, 'yyyy-MM-dd');
    startDate = new Date(startDate.getTime() + 86400000);
    const uptimeData = [];
    let batch = []; // Batch storage for inserts

    let currentTime = new Date(day);
    currentTime.setHours(START_HOUR, 0, 0, 0);
    const endTime = new Date(day);
    endTime.setHours(END_HOUR, 0, 0, 0);

    // Ensure the device starts with a "connected" state
    let lastState: "connected" | "disconnected" = "connected";
    batch.push({
      timestamp: new Date(currentTime),
      metadata: {
        deviceId: 'device-123',
        data: lastState,
        timestamp: currentTime.getTime(),
      },
    });

    // Generate 1-3 events per day
    const numEvents = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3
    let lastEventTime = currentTime;

    for (let j = 0; j < numEvents; j++) {
      // Ensure at least one pair of events has a time difference of less than 120 seconds
      const timeDifference = j === 1 ? Math.floor(Math.random() * 120) * 1000 : Math.floor(Math.random() * 3600) * 1000;
      const eventTime = new Date(lastEventTime.getTime() + timeDifference);

      if (eventTime >= endTime) break; // Stop if the event time exceeds the end time

      lastState = lastState === "connected" ? "disconnected" : "connected";

      batch.push({
        timestamp: eventTime,
        metadata: {
          deviceId: 'device-123',
          data: lastState,
          timestamp: eventTime.getTime(),
        },
      });

      lastEventTime = eventTime;

      // Perform batch insert when batch size reaches the limit
      if (batch.length >= BATCH_SIZE) {
        await UptimeData.insertMany(batch);
        batch = []; // Clear batch after insert
      }
    }

    // Ensure the device ends with a "disconnected" state
    if (lastState === "connected") {
      batch.push({
        timestamp: endTime,
        metadata: {
          deviceId: 'device-123',
          data: "disconnected",
          timestamp: endTime.getTime(),
        },
      });
    }

    // Insert remaining records in the batch (if any)
    if (batch.length > 0) {
      await UptimeData.insertMany(batch);
    }

    // Write the generated data to a JSON file
    fs.writeFileSync(
      path.join(UPTIME_DIR, `${formattedDate}.json`),
      JSON.stringify(batch, null, 2)
    );

    console.log(`Generated uptime data for ${formattedDate}`);
  }
};

const runGeneration = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydb';

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 20000,
      retryWrites: true,
      maxPoolSize: 10
    });
    console.log('MongoDB Connected');

    await generateUptimeData();
    
    console.log('Uptime data generation complete.');
  } catch (err) {
    console.error('MongoDB Connection or Data Generation Error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

runGeneration();
