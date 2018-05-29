import { getAuthenticatedUser } from './auth'
import { HttpError } from '../lib'

export default {
  async userAdded (baseParams, args, ctx) {
    const user = await getAuthenticatedUser(ctx)
    if (user.id !== args.userId) return HttpError.unauthorized()

    baseParams.context = ctx
    return baseParams
  },
  async activityAdded (baseParams, args, ctx) {
    baseParams.context = ctx
    return baseParams
  }
}
