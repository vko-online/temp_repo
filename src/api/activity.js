import min from 'lodash/min'
import max from 'lodash/max'

import { getAuthenticatedUser } from './auth'
import { Activity, Invitation, User, Message } from '../models'

import { HttpError } from '../lib'
import { getFileUrl } from '../files'

export default {
  async all (_, args, ctx) {
    const user = await getAuthenticatedUser(ctx)
    // const user = await User.findOne({ phone: '5555648583' })
    const query = {
      is_public: true
    }
    if (args.filter) {
      if (args.filter.text) {
        const expression = args.filter.text.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')
        query.title = new RegExp(expression, 'gi')
      }
      if (args.filter.dates) {
        const dates = args.filter.dates.map(v => new Date(v))
        const minDate = min(dates)
        const maxDate = max(dates)
        query.start_date = { $gte: minDate, $lte: maxDate }
      } else {
        const now = new Date()
        query.start_date = { $gte: now, $lte: now.setFullYear(now.getFullYear() + 1) }
      }
      if (args.filter.archived) {
        query.is_archived = true
      }
    }

    const userFriendIds = user.friends.map(v => v.user)
    const userIds = userFriendIds.concat(user._id)

    return Activity.aggregate([
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
          created_by: { $in: userIds },
          is_deleted: { $ne: true },
          ...query
        }
      }
    ])
  },

  async getById (_, args, ctx) {
    await getAuthenticatedUser(ctx)

    const activity = await Activity.findById(args.id)
    if (activity && (activity.is_deleted !== true)) {
      return activity
    }

    return HttpError.notFound()
  },

  async image_url (activity, args, ctx) {
    return (activity.image && activity.image.filename) ? getFileUrl(activity.image.filename) : ''
  },
  async invitations (activity, args, ctx) {
    return Invitation
      .find({
        _id: {
          $in: activity.invitations
        }
      })
      .populate('user')
  },
  created_by (activity, args, ctx) {
    return User.findById(activity.created_by)
  },

  async createDecision (_, args, ctx) {
    const activityId = args.decision.activityId
    const answer = args.decision.answer
    const invitationId = args.decision.invitationId

    await Invitation.findByIdAndUpdate(invitationId, {
      $set: {
        decision: answer,
        updated_at: new Date()
      }
    }, {
      upsert: false
    })

    return Activity.findById(activityId)
  },

  async createMessage (_, args, ctx) {
    const { activityId, content, content_type } = args.message // eslint-disable-line camelcase
    const contentType = content_type || 'text' // eslint-disable-line camelcase
    const user = await getAuthenticatedUser(ctx)

    const activity = await Activity.findById(activityId)

    const message = await Message.create({
      created_by: user.id,
      created_at: new Date(),
      activity,
      content,
      content_type: contentType
    })

    activity.participants(async (_, participants) => {
      const otherUsersPromises = participants
        .filter(v => v.id !== user.id)
        .map(usr => usr.update({ $inc: { badgeCount: 1 } }))

      const otherUsers = await Promise.all(otherUsersPromises)
      const registeredUsers = otherUsers.filter(usr => !!usr.registrationId)

      if (registeredUsers.length) {
        console.log('send PUSH')
      }
    })

    return message
  },

  async messages (activity, { messageConnection = {} }) {
    const { first, last, before, after } = messageConnection
    // base query -- get messages from the right match
    const filter = { activity: activity.id }
    // because we return messages from newest -> oldest
    // before actually means newer (date > cursor)
    // after actually means older (date < cursor)

    if (before) {
      // convert base-64 to utf8 iso date and use in Date constructor
      filter._id = { $gt: Buffer.from(before, 'base64').toString() }
    }

    if (after) {
      filter._id = { $lt: Buffer.from(after, 'base64').toString() }
    }

    const messages = await Message
      .find(filter)
      .sort({'_id': -1})
      .limit(first || last)
      .exec()

    const edges = messages.map(message => ({
      cursor: Buffer.from(message.id.toString()).toString('base64'), // convert createdAt to cursor
      node: message // the node is the message itself
    }))

    return {
      edges,
      pageInfo: {
        async hasNextPage () {
          if (!messages.length || (messages.length < (last || first))) {
            return Promise.resolve(false)
          }
          const msgs = await Message.findOne({
            activity: activity.id,
            _id: {
              [before ? '$gt' : '$lt']: messages[messages.length - 1].id
            }
          }).sort({'_id': -1})
          return !!msgs
        },
        async hasPreviousPage () {
          const msgs = await Message.findOne({
            activity: activity.id,
            _id: filter._id
          })
          return !!msgs
        }
      }
    }
  },

  async deleteActivity (_, args, ctx) {
    const id = args.id
    const activity = await Activity.findById(id)

    activity.is_deleted = true

    return activity.save()
  },
  async toggleArchiveActivity (_, args, ctx) {
    const id = args.id
    const activity = await Activity.findById(id)

    activity.is_archived = !activity.is_archived

    return activity.save()
  }
}
