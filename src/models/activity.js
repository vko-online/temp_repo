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
  min_payment: Number,
  min_people: Number,
  require_people_decision: Boolean,
  is_archived: Boolean,
  is_blocked: Boolean,
  people_invited: {
    type: [{
      type: Schema.ObjectId,
      ref: 'User'
    }]
  },
  people_seen_by: {
    type: [{
      type: Schema.ObjectId,
      ref: 'User'
    }]
  },
  people_going: {
    type: [{
      type: Schema.ObjectId,
      ref: 'User'
    }]
  },
  people_maybe_going: {
    type: [{
      type: Schema.ObjectId,
      ref: 'User'
    }]
  },
  people_not_going: {
    type: [{
      type: Schema.ObjectId,
      ref: 'User'
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
