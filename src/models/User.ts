import { Schema, model, Document } from 'mongoose'

interface IUser extends Document {
  providerId: string
  email: string
  name: string
  provider: string
  tokens: { token: string; expiresAt: Date }[]
  createdAt?: Date
  updatedAt?: Date
}

const userSchema = new Schema<IUser>({
  providerId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  provider: { type: String, required: true },
  tokens: [
    {
      token: { type: String, required: true },
      expiresAt: { type: Date, required: true },
    },
  ],
}, { timestamps: true })

const User = model<IUser>('User', userSchema)

export default User