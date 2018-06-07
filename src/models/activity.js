import mongoose, { Schema } from 'mongoose'

const activitySchema = new Schema({
  title: String,
  image: {
    filename: String,
    width: Number,
    height: Number
  },
  description: String,
  created_at: Date,
  start_date: Date,
  end_date: Date,
  created_by: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  additional_json: String,
  require_people_decision: Boolean,
  is_archived: Boolean,
  is_public: Boolean,
  invitations: {
    type: [{
      type: Schema.ObjectId,
      ref: 'Invitation'
    }]
  },
  messages: {
    type: [{
      type: Schema.ObjectId,
      ref: 'Message'
    }]
  }
})

export default mongoose.model('Activity', activitySchema)
