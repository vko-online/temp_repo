import mongoose, { Schema } from 'mongoose'

const groupSchema = new Schema({
  name: String,
  users: {
    type: [{
      type: Schema.ObjectId,
      ref: 'User'
    }]
  }
})

export default mongoose.model('Group', groupSchema)
