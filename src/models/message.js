import mongoose, { Schema } from 'mongoose'

const messageSchema = new Schema({
  created_by: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  created_at: Date,
  content: String,
  content_type: String,
  activity: {
    type: Schema.ObjectId,
    ref: 'Activity'
  }
})

export default mongoose.model('Message', messageSchema)
