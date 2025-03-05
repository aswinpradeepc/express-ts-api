import { Request, Response } from 'express';
import AnalyticsData from '../models/AnalyticsData';

export const getAnalyticsData = async (req: Request, res: Response) => {
  try {
    const { deviceId, date } = req.query;

    if (!deviceId || !date) {
      return res.status(400).json({ error: 'deviceId and date are required' });
    }

    const startDate = new Date(date as string);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const data = await AnalyticsData.aggregate([
      { $match: { 'metadata.deviceId': deviceId, timestamp: { $gte: startDate, $lt: endDate } } },
      {
        $group: {
          _id: { hour: { $hour: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize all 24 hours with count 0
    const dataByHour: number[] = Array(24).fill(0);

    // Populate the actual data
    let totalCount = 0;
    let busiestHour = 0;
    let maxCount = 0;

    data.forEach(({ _id, count }) => {
      const hour = _id.hour;
      dataByHour[hour] = count;
      totalCount += count;
      if (count > maxCount) {
        maxCount = count;
        busiestHour = hour;
      }
    });

    if (totalCount === 0) {
      return res.status(404).json({ error: 'No data found for the given deviceId and date' });
    }

    const avg = totalCount / 24; // Dividing by 24 since we have all hours

    res.json({
      dataByHour,
      net: totalCount,
      avg,
      busiestHour: busiestHour.toString(),
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error', details: 'An unknown error occurred' });
    }
  }
};
