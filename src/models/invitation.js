import mongoose, { Schema } from 'mongoose'

const invitationSchema = new Schema({
  have_seen: Boolean,
  decision: String,
  created_at: Date,
  updated_at: Date,
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
})

export default mongoose.model('Invitation', invitationSchema)
