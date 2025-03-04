import { Schema, model, Document, Model } from 'mongoose'

interface IMetadata {
  deviceId: string
  data: 0 | 1 // 0: Not triggered, 1: Triggered
  timestamp: number // Time in milliseconds
}

interface IAnalyticsData extends Document {
  timestamp: Date
  metadata: IMetadata
}

const analyticsDataSchema = new Schema<IAnalyticsData>({
  timestamp: { type: Date, required: true },
  metadata: {
    deviceId: { type: String, required: true },
    data: { type: Number, enum: [0, 1], required: true },
    timestamp: { type: Number, required: true }
  }
})

const AnalyticsData: Model<IAnalyticsData> = model<IAnalyticsData>('AnalyticsData', analyticsDataSchema)

AnalyticsData.createCollection({
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata',
    granularity: 'seconds'
  },
  expireAfterSeconds: 31536000 // 1-year retention
})

export default AnalyticsData