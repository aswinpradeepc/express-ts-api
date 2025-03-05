import express from 'express'
import authRoutes from './routes/auth'
import analyticsRoutes from './routes/analytics'
import uptimeRoutes from './routes/uptime'
import reportRoutes from './routes/report';
import { errorHandler } from './middleware/errorHandler'
import dotenv from 'dotenv'
import { setupSwagger } from './config/swaggerConfig'

dotenv.config()

const app = express()

// Middleware
app.use(express.json())

// Routes
app.use('/auth', authRoutes)
app.use('/analytics', analyticsRoutes)
app.use('/uptime', uptimeRoutes)
app.use('/report', reportRoutes);

// Swagger setup
setupSwagger(app)

// Error handling middleware
app.use(errorHandler)

export default app