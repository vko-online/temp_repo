import mongoose, { Schema } from 'mongoose'

const activitySchema = new Schema({
  title: String,
  image: {
    filename: String,
    width: Number,
    height: Number
  },
  color: String,
  description: String,
  created_at: Date,
  start_date: Date,
  end_date: Date,
  created_by: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  location: String,
  geolocation: {
    type: {
      type: String
    },
    coordinates: [Number]
  },
  additional_json: String,
  require_people_decision: Boolean,
  is_deleted: Boolean,
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

activitySchema.methods.participants = async function (cb) {
  const invitations = await this.model('Invitation').find({
    _id: {
      $in: this.invitations
    }
  })

  const activeInvitations = invitations.filter(inv => ['going', 'maybe'].includes(inv.decision))
  const userIds = activeInvitations.map(v => v.user)
  const users = await this.model('User').find({
    _id: {
      $in: userIds
    }
  })
  return cb(null, users)
}

activitySchema.index({ 'geolocation': '2dsphere' })

export default mongoose.model('Activity', activitySchema)
