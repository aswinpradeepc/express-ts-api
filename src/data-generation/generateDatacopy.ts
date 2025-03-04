import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { format } from 'date-fns';
import AnalyticsData from '../models/AnalyticsData';
import UptimeData from '../models/UptimeData';

const DAYS = 60;
const START_HOUR = 8;
const END_HOUR = 22;
const ANALYTICS_DIR = path.join(__dirname, 'analytics');
const UPTIME_DIR = path.join(__dirname, 'uptime');

if (!fs.existsSync(ANALYTICS_DIR)) fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
if (!fs.existsSync(UPTIME_DIR)) fs.mkdirSync(UPTIME_DIR, { recursive: true });

const safeDropCollection = async (model: mongoose.Model<any>) => {
  try {
    await model.collection.drop();
    console.log(`Dropped collection: ${model.collection.name}`);
  } catch (err: any) {
    if (err.code === 26 || err.message.includes('ns not found')) {
      console.log(`Collection ${model.collection.name} does not exist`);
    } else if (err.message.includes('a view')) {
      console.log(`Attempting to remove view: ${model.collection.name}`);
      // You might need to use raw MongoDB driver to drop a view
      await mongoose.connection.db?.dropCollection(model.collection.name);
    } else {
      console.error(`Error dropping collection ${model.collection.name}:`, err);
    }
  }
};

const generateAnalyticsData = async () => {
  // Ensure collection is dropped before generation
  await safeDropCollection(AnalyticsData);

  let startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS);

  for (let i = 0; i < DAYS; i++) {
    const day = new Date(startDate);
    const formattedDate = format(day, 'yyyy-MM-dd');
    startDate = new Date(startDate.getTime() + 86400000);
    const analyticsData = [];
    let currentTime = new Date(day);
    currentTime.setHours(START_HOUR, 0, 0, 0);
    const endTime = new Date(day);
    endTime.setHours(END_HOUR, 0, 0, 0);

    while (currentTime < endTime) {
      analyticsData.push({
        timestamp: currentTime.getTime(),
        metadata: {
          deviceId: 'device-123',
          data: Math.random() < 0.5 ? 0 : 1,
          timestamp: currentTime.getTime()
        },
      });
      currentTime.setMinutes(currentTime.getMinutes() + 1);
    }

    fs.writeFileSync(
      path.join(ANALYTICS_DIR, `${formattedDate}.json`),
      JSON.stringify(analyticsData, null, 2)
    );
    await AnalyticsData.insertMany(analyticsData);
  }
};

const generateUptimeData = async () => {
  // Ensure collection is dropped before generation
  await safeDropCollection(UptimeData);

  let startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS);

  for (let i = 0; i < DAYS; i++) {
    const day = new Date(startDate);
    const formattedDate = format(day, 'yyyy-MM-dd');
    const uptimeData: { timestamp: number; metadata: { deviceId: string; data: string; timestamp: number } }[] = [];
    const connectTime = new Date(day.setHours(START_HOUR, 0, 0, 0));
    const disconnectTime = new Date(day.setHours(END_HOUR, 0, 0, 0));

    let currentTime = new Date(connectTime);
    let lastState = null;
    let lastTimestamp = 0;

    const initialTimestamp = currentTime.getTime();
    uptimeData.push({
      timestamp: initialTimestamp,
      metadata: { 
        deviceId: 'device-123', 
        data: 'connected', 
        timestamp: initialTimestamp 
      },
    });
    lastTimestamp = initialTimestamp;
    lastState = 'connected';

    while (currentTime.getTime() < disconnectTime.getTime() - (60 * 1000)) { 
      const nextState: 'connected' | 'disconnected' = lastState === 'connected' ? 'disconnected' : 'connected';
      
      const minInterval = 2 * 60 * 1000; 
      const maxInterval = 2 * 60 * 60 * 1000; 
      const stateChangeDuration = minInterval + Math.floor(Math.random() * (maxInterval - minInterval));
      
      const newTimestamp = lastTimestamp + stateChangeDuration + Math.floor(Math.random() * 1000);
      
      if (newTimestamp >= disconnectTime.getTime() - (60 * 1000)) {
        break;
      }

      uptimeData.push({
        timestamp: newTimestamp,
        metadata: { 
          deviceId: 'device-123', 
          data: nextState, 
          timestamp: newTimestamp 
        },
      });

      lastTimestamp = newTimestamp;
      lastState = nextState;
      currentTime = new Date(newTimestamp);
    }

    const finalTimestamp = disconnectTime.getTime();
    uptimeData.push({
      timestamp: finalTimestamp,
      metadata: { 
        deviceId: 'device-123', 
        data: 'disconnected', 
        timestamp: finalTimestamp 
      },
    });

    const hasConsecutiveSameStates = uptimeData.some((entry, index) => {
      if (index > 0) {
        return entry.metadata.data === uptimeData[index - 1].metadata.data;
      }
      return false;
    });

    const hasNonUniqueTimestamps = new Set(uptimeData.map(entry => entry.timestamp)).size !== uptimeData.length;

    if (hasConsecutiveSameStates || hasNonUniqueTimestamps) {
      console.warn(`Data constraints violated in ${formattedDate}. Regenerating...`);
      continue;
    }

    fs.writeFileSync(
      path.join(UPTIME_DIR, `${formattedDate}.json`),
      JSON.stringify(uptimeData, null, 2)
    );
    await UptimeData.insertMany(uptimeData);
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

    await generateAnalyticsData();
    await generateUptimeData();
    
    console.log('Data generation complete.');
  } catch (err) {
    console.error('MongoDB Connection or Data Generation Error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

runGeneration();