import { Activity, User } from '../models'

export default {
  created_by (message, args, ctx) {
    return User.findById(message.created_by)
  },
  activity (message, args, ctx) {
    return Activity.findById(message.activity)
  }
}
