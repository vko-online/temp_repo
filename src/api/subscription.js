import { getAuthenticatedUser } from './auth'
import { HttpError } from '../lib'

import { Activity, Invitation } from '../models'

export default {
  // async userAdded (baseParams, args, ctx) {
  //   const user = await getAuthenticatedUser(ctx)
  //   if (user.id !== args.userId) return HttpError.unauthorized()

  //   baseParams.context = ctx
  //   return baseParams
  // },
  async activityAdded (baseParams, args, ctx) {
    baseParams.context = ctx
    return baseParams
  },
  async messageAdded (baseParams, args, ctx) {
    // todo: not tested
    const user = await getAuthenticatedUser(ctx)
    const activities = await Activity.aggregate([
      {
        $lookup: {
          from: Invitation.collection.name,
          let: { 'invitations': '$invitations' },
          pipeline: [
            { $match: {
              user: user._id,
              $expr: { $in: [ '$_id', '$$invitations' ] }
            }}
          ],
          as: 'invitations'
        }
      },
      {
        $match: {
          'invitations.user': user._id,
          'invitations.decision': { $in: ['no', 'maybe', 'going'] },
          _id: {
            $in: args.activityIds
          }
        }
      }
    ])

    // user attempted to subscribe to some activities without access
    if (args.activityIds.length > activities.length) {
      return HttpError.unauthorized()
    }

    baseParams.context = ctx
    return baseParams
  }
}
