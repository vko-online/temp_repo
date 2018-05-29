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
  dob: Date,
  version: Number,
  groups: {
    type: [{
      type: Schema.ObjectId,
      ref: 'Group'
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
