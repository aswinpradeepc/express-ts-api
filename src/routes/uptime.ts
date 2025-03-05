import { Router } from 'express';
import { getUptimeData } from '../controllers/uptimeController';
import asyncHandler from '../utils/asyncHandler';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /uptime/data:
 *   get:
 *     summary: Get uptime data for a specific day
 *     description: Returns the uptime data for a device for a specific day, including the duration of each state.
 *     tags:
 *       - Uptime
 *     security:
 *       - bearerAuth: []
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
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   state:
 *                     type: string
 *                     enum: [connected, disconnected]
 *                   duration:
 *                     type: integer
 *                     description: Duration in milliseconds
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No uptime data found
 */
router.get('/data', authMiddleware, asyncHandler(getUptimeData));

export default router;