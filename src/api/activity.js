import { getAuthenticatedUser } from './auth'
import { Activity } from '../models'

import { HttpError } from '../lib'
import { getFileUrl } from '../files'

export default {
  async all (_, args) {
    if (args.text) {
      return Activity.find({ title: new RegExp(args.text, 'gi') })
    }
    return Activity.find()
  },

  async getById (_, args, ctx) {
    await getAuthenticatedUser(ctx)

    const activity = await Activity.findById(args.id)
    if (activity) {
      return activity
    }

    return HttpError.notFound()
  },

  async image_url (activity, args, ctx) {
    return (activity.image && activity.image.filename) ? getFileUrl(activity.image.filename) : ''
  }
}
