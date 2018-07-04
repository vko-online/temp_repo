import GraphQLDate from 'graphql-date'
import { withFilter } from 'graphql-subscriptions'

import { pubsub } from './subscriptions'
import { userApi, activityApi, messageApi } from './api'

const MESSAGE_ADDED_TOPIC = 'messageAdded'
const ACTIVITY_ADDED_TOPIC = 'activityAdded'

export const resolvers = {
  Date: GraphQLDate,
  Query: {
    users: userApi.all,
    currentUser: userApi.currentUser,
    activities: activityApi.all,
    activity: activityApi.getById
  },
  User: {
    avatar_url: userApi.avatar_url,
    groups: userApi.groups,
    contacts: userApi.contacts,
    friends: userApi.friends
  },
  Activity: {
    id: (activity, args, ctx) => activity._id,
    image_url: activityApi.image_url,
    invitations: activityApi.invitations,
    created_by: activityApi.created_by,
    messages: activityApi.messages
  },
  Message: {
    activity: messageApi.activity,
    created_by: messageApi.created_by
  },
  Mutation: {
    async login (_, args, ctx) {
      return userApi.login(_, args, ctx)
    },
    async signup (_, args, ctx) {
      return userApi.signup(_, args, ctx)
    },

    async createGroup (_, args, ctx) {
      return userApi.createGroup(_, args, ctx)
    },
    async deleteGroup (_, args, ctx) {
      return userApi.deleteGroup(_, args, ctx)
    },

    async importContacts (_, args, ctx) {
      return userApi.importContacts(_, args, ctx)
    },

    async updateUser (_, args, ctx) {
      return userApi.updateUser(_, args, ctx)
    },
    async removeUserImage (_, args, ctx) {
      return userApi.removeUserImage(_, args, ctx)
    },

    async createDecision (_, args, ctx) {
      return activityApi.createDecision(_, args, ctx)
    },

    async createMessage (_, args, ctx) {
      return activityApi.createMessage(_, args, ctx)
    },

    async deleteActivity (_, args, ctx) {
      return activityApi.deleteActivity(_, args, ctx)
    },
    async toggleArchiveActivity (_, args, ctx) {
      return activityApi.toggleArchiveActivity(_, args, ctx)
    }
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(MESSAGE_ADDED_TOPIC),
        (payload, args, ctx) => {
          return ctx.user.then(user => {
            return Boolean(
              args.activityIds &&
                ~args.activityIds.indexOf(payload.messageAdded.activityId) &&
                user.id !== payload.messageAdded.userId // don't send to user creating message
            )
          })
        }
      )
    },
    activityAdded: {
      subscribe: pubsub.asyncIterator(ACTIVITY_ADDED_TOPIC)
    }
  }
}

export default resolvers
