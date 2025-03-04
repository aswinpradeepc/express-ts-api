import { Schema, model, Document, Model } from 'mongoose'

interface IMetadata {
  deviceId: string
  data: "connected" | "disconnected" // "connected" or "disconnected"
  timestamp: number // Time in milliseconds
}

interface IUptimeData extends Document {
  timestamp: Date
  metadata: IMetadata
}

const uptimeDataSchema = new Schema<IUptimeData>({
  timestamp: { type: Date, required: true },
  metadata: {
    deviceId: { type: String, required: true },
    data: { type: String, enum: ["connected", "disconnected"], required: true },
    timestamp: { type: Number, required: true }
  }
})

const UptimeData: Model<IUptimeData> = model<IUptimeData>('UptimeData', uptimeDataSchema)

UptimeData.createCollection({
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata',
    granularity: 'seconds'
  },
  expireAfterSeconds: 31536000 // 1-year retention
})

export default UptimeData