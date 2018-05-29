import mongoose, { Schema } from 'mongoose'

const groupSchema = new Schema({
  name: String,
  contacts: {
    type: [{
      type: Schema.ObjectId,
      ref: 'Contact'
    }]
  }
})

export default mongoose.model('Group', groupSchema)
