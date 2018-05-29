import GraphQLDate from 'graphql-date'

import { pubsub } from './subscriptions'
import { userApi, activityApi } from './api'

const USER_ADDED_TOPIC = 'userAdded'
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
    contacts: userApi.contacts
  },
  Activity: {
    image_url: activityApi.image_url
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
    }
  },
  Subscription: {
    userAdded: {
      subscribe: pubsub.asyncIterator(USER_ADDED_TOPIC)
    },
    activityAdded: {
      subscribe: pubsub.asyncIterator(ACTIVITY_ADDED_TOPIC)
    }
  }
}

export default resolvers
