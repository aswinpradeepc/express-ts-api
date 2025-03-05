import { Router } from 'express';
import { getAnalyticsData } from '../controllers/analyticsController';
import asyncHandler from '../utils/asyncHandler';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /analytics/data:
 *   get:
 *     summary: Get aggregated analytical data
 *     description: Returns the number of data sent per hour in a day, total number of data sent in a day, and the average rate of data and the busiest hour.
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the device
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The date for which to retrieve data (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hourlyData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       hour:
 *                         type: integer
 *                       count:
 *                         type: integer
 *                 totalData:
 *                   type: integer
 *                 total0:
 *                   type: integer
 *                 total1:
 *                   type: integer
 *                 averageRate:
 *                   type: number
 *                 busiestHour:
 *                   type: integer
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/data', authMiddleware, asyncHandler(getAnalyticsData));

export default router;