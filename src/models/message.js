import mongoose, { Schema } from 'mongoose'

const messageSchema = new Schema({
  created_by: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  created_at: Date,
  content: String
})

export default mongoose.model('Message', messageSchema)
