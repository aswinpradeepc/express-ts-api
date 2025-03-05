import { Request, Response } from 'express';
import AnalyticsData from '../models/AnalyticsData';
import UptimeData from '../models/UptimeData';

export const getOverallReport = async (req: Request, res: Response) => {
  const { deviceId, startDate, endDate } = req.query;

  if (!deviceId || !startDate || !endDate) {
    return res.status(400).json({ error: 'deviceId, startDate, and endDate are required' });
  }

  const start = new Date(startDate as string);
  const end = new Date(endDate as string);

  try {
    // Total and average analytical data
    const totalRecords = await AnalyticsData.countDocuments({
      'metadata.deviceId': deviceId,
      timestamp: { $gte: start, $lt: end },
    });

    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const averageRecordsPerDay = totalRecords / days;

    // Busiest and quietest days
    const dailyRecords = await AnalyticsData.aggregate([
      { $match: { 'metadata.deviceId': deviceId, timestamp: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          recordCount: { $sum: 1 },
        },
      },
      { $sort: { recordCount: -1 } },
    ]);

    const busiestDays = dailyRecords.slice(0, 3).map(record => ({
      date: record._id,
      recordCount: record.recordCount,
    }));

    const quietestDays = dailyRecords.slice(-3).map(record => ({
      date: record._id,
      recordCount: record.recordCount,
    }));

    // Total uptime and downtime
    const uptimeData = await UptimeData.find({
      'metadata.deviceId': deviceId,
      timestamp: { $gte: start, $lt: end },
    }).select('timestamp metadata.data -_id');

    let totalUptime = 0;
    let totalDowntime = 0;
    let totalReboots = 0;

    uptimeData.forEach((item, index) => {
      const nextItem = uptimeData[index + 1];
      if (nextItem) {
        const duration = new Date(nextItem.timestamp).getTime() - new Date(item.timestamp).getTime();
        if (item.metadata.data === 'connected') {
          totalUptime += duration;
        } else {
          totalDowntime += duration;
          if (duration < 2 * 60 * 1000) {
            totalReboots += 1;
          }
        }
      }
    });

    const formatDuration = (duration: number) => {
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours} hours ${minutes} minutes`;
    };

    res.json({
      totalRecords,
      averageRecordsPerDay,
      busiestDays,
      quietestDays,
      totalUptime: formatDuration(totalUptime),
      totalDowntime: formatDuration(totalDowntime),
      totalReboots,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
  }
};