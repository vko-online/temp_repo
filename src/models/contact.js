import mongoose, { Schema } from 'mongoose'

const contactSchema = new Schema({
  name: String,
  phone: String,
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
})

export default mongoose.model('Contact', contactSchema)
