import express from 'express';
import dotenv from 'dotenv';
import { initializeDB } from './config/db';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initializeDB(); // Ensure database is ready before starting the server

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

startServer();
