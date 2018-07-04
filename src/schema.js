import { makeExecutableSchema } from 'graphql-tools'

import resolvers from './resolvers'

export const schema = [
  `
  # declare custom scalars
  scalar Date

  # input for file types
  input File {
    name: String!
    type: String!
    size: Int!
    path: String!
  }

  # input for relay cursor connections
  input ConnectionInput {
    first: Int
    after: String
    last: Int
    before: String
  }

  type MessageConnection {
    edges: [MessageEdge]
    pageInfo: PageInfo!
  }

  type MessageEdge {
    cursor: String!
    node: Message!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  input CreateMessageInput {
    activityId: String!
    content: String!
    content_type: String
  }

  # input for signing in users
  input SigninUserInput {
    phone: String!
    password: String!
  }

  # input for registering user
  input SignupUserInput {
    phone: String!
    password: String!
  }

  input CreateGroupInput {
    name: String!
    userIds: [String]
  }

  input CreateActivityInput {
    title: String!
    description: String
    start_date: Date
    end_date: Date
    additional_json: String
    require_people_decision: Boolean
    is_public: Boolean
  }


  input CreateContactInput {
    name: String!
    phone: String!
  }

  # input for updating users
  input UpdateUserInput {
    avatar: File
    name: String
    about: String
  }

  # input for removing user image
  input RemoveUserImageInput {
    image: String! # image id
  }

  input ActivityFilterInput {
    dates: [String]
    text: String
    archived: Boolean
  }

  input CreateDecisionInput {
    invitationId: String!
    activityId: String!
    answer: String
  }


  type Contact {
    id: String!
    name: String
    phone: String
    user: [User]
  }

  type Group {
    id: String!
    name: String!
    users: [User]
  }

  type Image {
    filename: String
    width: Int
    height: Int
  }

  type Friend {
    nickname: String
    user: User
  }

  # a user -- keep type really simple for now
  type User {
    id: String! # unique id for the user
    phone: String! # this is the name we'll show other users
    avatar: Image # image file
    avatar_url: String # full path to image
    name: String
    about: String # user private status
    badgeCount: Int
    registrationId: String

    jwt: String # json web token for access

    contacts: [Contact] # user contacts from phone addressbook
    groups: [Group] # grouped user contacts from phone addressbook

    friends: [Friend]
  }

  type Invitation {
    id: String!
    have_seen: Boolean
    created_at: Date
    updated_at: Date
    decision: String
    user: User
  }

  type Geolocation {
    type: String
    coordinates: [Float]
  }

  # Activity model - represents core 
  type Activity {
    id: String! # activity id
    title: String # title of activity
    color: String
    image: Image # optional image
    image_url: String
    description: String # longer description text
    created_at: Date # timestamp user created this activity

    start_date: Date # activity starting date
    end_date: Date # activity ending date, can be same date as start_date
    created_by: User # owner of activity

    additional_json: String # additional info in json format
    require_people_decision: Boolean # activity requires decision

    location: String
    geolocation: Geolocation

    is_archived: Boolean # editable/votable or not
    is_public: Boolean
    invitations: [Invitation]
    messages(messageConnection: ConnectionInput): MessageConnection
  }

  type Message {
    id: String! # common id
    activity: Activity
    created_by: User # owner of message
    created_at: Date # created date of message
    content: String # message text
    content_type: String # message type
  }

  # query for types
  type Query {
    # Return users
    users(text: String) : [User]

    # Return single user by its id
    currentUser: User

    # Return activities with text filter
    activities(filter: ActivityFilterInput) : [Activity]

    # Return single activity
    activity(id: String!): Activity
  }

  type Mutation {
    login(user: SigninUserInput!): User # regular phone/password signin
    signup(user: SignupUserInput!): User # phone/password signup

    updateUser(user: UpdateUserInput!): User # update user
    removeUserImage(user: RemoveUserImageInput!): User # remove user image

    createGroup(group: CreateGroupInput!): Group # create group from name and bunch of contacts
    deleteGroup(id: String!): Group # delete group by id

    importContacts(contacts: [CreateContactInput]): [Contact] # import contact, supports batch

    createDecision(decision: CreateDecisionInput!): Activity

    createMessage(message: CreateMessageInput!): Message

    deleteActivity(id: String!): Activity
    toggleArchiveActivity(id: String!): Activity
  }

  type Subscription {
    activityAdded: Activity
    messageAdded(activityIdsIds: [String]): Message
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`
]

export const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: resolvers
})

export default executableSchema
