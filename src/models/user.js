import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
  phone: String,
  name: String,
  password: String,
  avatar: {
    filename: String,
    width: Number,
    height: Number
  },
  about: String,
  version: Number,
  badgeCount: Number,
  registrationId: String,
  groups: {
    type: [{
      type: Schema.ObjectId,
      ref: 'Group'
    }]
  },
  friends: {
    type: [{
      nickname: String,
      user: {
        type: Schema.ObjectId,
        ref: 'User'
      }
    }]
  },
  contacts: {
    type: [{
      type: Schema.ObjectId,
      ref: 'Contact'
    }]
  }
})

export default mongoose.model('User', userSchema)
