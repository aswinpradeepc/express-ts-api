import { Schema, model, Document, Model } from 'mongoose';

interface IMetadata {
  deviceId: string;
  data: 0 | 1;
  timestamp: number;
}

interface IAnalyticsData extends Document {
  timestamp: Date;
  metadata: IMetadata;
}

const analyticsDataSchema = new Schema<IAnalyticsData>({
  timestamp: { type: Date, required: true },
  metadata: {
    deviceId: { type: String, required: true },
    data: { type: Number, enum: [0, 1], required: true },
    timestamp: { type: Number, required: true },
  },
});

const AnalyticsData: Model<IAnalyticsData> = model<IAnalyticsData>('AnalyticsData', analyticsDataSchema);

export default AnalyticsData;
