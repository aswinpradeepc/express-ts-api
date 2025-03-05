import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydb';

// Function to create time-series collections
const createTimeSeriesCollection = async (collectionName: string) => {
  const db = mongoose.connection.db;

  if (!db) {
    console.error('MongoDB connection not established. Cannot create collection.');
    return;
  }

  const collections = await db.listCollections().toArray();
  const collectionExists = collections.some(col => col.name === collectionName);

  if (!collectionExists) {
    console.log(`Creating time-series collection: ${collectionName}`);
    await db.createCollection(collectionName, {
      timeseries: {
        timeField: 'timestamp',
        metaField: 'metadata',
        granularity: 'seconds'
      },
      expireAfterSeconds: 31536000 // 1-year retention
    });
  } else {
    console.log(`Time-series collection "${collectionName}" already exists.`);
  }
};

// Function to initialize the database connection
export const initializeDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 20000,
      retryWrites: true,
      maxPoolSize: 10,
    });

    // Ensure connection is established before proceeding
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB connection not ready');
    }

    console.log('MongoDB Connected');

    // Ensure all required time-series collections exist
    await createTimeSeriesCollection('analyticsdatas');
    await createTimeSeriesCollection('uptimedatas');

  } catch (error) {
    console.error('MongoDB Initialization Error:', error);
    process.exit(1);
  }
};

// Function to disconnect the database
export const closeDB = async () => {
  await mongoose.disconnect();
  console.log('MongoDB Disconnected');
};
