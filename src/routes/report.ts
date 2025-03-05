import { Router } from 'express';
import { getOverallReport } from '../controllers/reportController';
import asyncHandler from '../utils/asyncHandler';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /report/overall:
 *   get:
 *     summary: Get overall report
 *     description: Returns the overall report including total and average analytical data, busiest and quietest days, total uptime and downtime, and number of reboots.
 *     tags:
 *       - Report
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
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The start date for the report (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The end date for the report (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRecords:
 *                   type: integer
 *                 averageRecordsPerDay:
 *                   type: number
 *                 busiestDays:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       recordCount:
 *                         type: integer
 *                 quietestDays:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       recordCount:
 *                         type: integer
 *                 totalUptime:
 *                   type: string
 *                 totalDowntime:
 *                   type: string
 *                 totalReboots:
 *                   type: integer
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/overall', authMiddleware, asyncHandler(getOverallReport));

export default router;