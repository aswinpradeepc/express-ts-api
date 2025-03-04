import express from 'express'
// import authRoutes from './routes/auth'
// import analyticsRoutes from './routes/analytics'
// import uptimeRoutes from './routes/uptime'
// import { errorHandler } from './middleware/errorHandler'
import connectDB from './config/db'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

// Middleware
app.use(express.json())

// Routes
// app.use('/auth', authRoutes)
// app.use('/analytics', analyticsRoutes)
// app.use('/uptime', uptimeRoutes)

// Error handling middleware
// app.use(errorHandler)

export default app