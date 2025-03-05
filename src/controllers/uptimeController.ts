import { Request, Response } from 'express';
import UptimeData from '../models/UptimeData';

export const getUptimeData = async (req: Request, res: Response) => {
  const { deviceId, date } = req.query;

  if (!deviceId || !date) {
    return res.status(400).json({ error: 'deviceId and date are required' });
  }

  const start = new Date(date as string);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  try {
    const data = await UptimeData.find({
      'metadata.deviceId': deviceId,
      timestamp: { $gte: start, $lt: end },
    }).select('timestamp metadata.data -_id');

    if (!data.length) {
      return res.status(404).json({ error: 'No uptime data found for the given device and date' });
    }

    const formattedData = data.map((item, index) => {
      const nextItem = data[index + 1];
      const duration = nextItem ? new Date(nextItem.timestamp).getTime() - new Date(item.timestamp).getTime() : 0;
      return {
        timestamp: item.timestamp,
        state: item.metadata.data,
        duration,
      };
    });

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
  }
};