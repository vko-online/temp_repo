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
    contactIds: [String]
  }

  input CreateContactInput {
    name: String!
    phone: String!
  }

  # input for updating users
  input UpdateUserInput {
    avatar: File
    name: String
    dob: Date
  }

  # input for removing user image
  input RemoveUserImageInput {
    image: String! # image id
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
    contacts: [Contact]
  }

  type Image {
    filename: String
    width: Int
    height: Int
  }

  # a user -- keep type really simple for now
  type User {
    id: String! # unique id for the user
    phone: String! # this is the name we'll show other users
    avatar: Image # image file
    avatar_url: String # full path to image
    name: String
    dob: Date # date of birth

    jwt: String # json web token for access

    contacts: [Contact] # user contacts from phone addressbook
    groups: [Group] # grouped user contacts from phone addressbook
  }

  type Invitation {
    id: String!
    have_seen: Boolean
    created_at: Date
    updated_at: Date
    decision: String
    user: User
  }

  # Activity model - represents core 
  type Activity {
    id: String! # activity id
    title: String # title of activity
    image: Image # optional image
    image_url: String
    description: String # longer description text
    created_at: Date # timestamp user created this activity

    start_date: Date # activity starting date
    end_date: Date # activity ending date, can be same date as start_date
    created_by: User # owner of activity

    additional_json: String # additional info in json format
    require_people_decision: Boolean # activity requires decision

    is_archived: Boolean # editable/votable or not
    is_public: Boolean
    invitations: [Invitation]
    messages: [Message] # discussion of activity
  }

  type Message {
    id: String! # common id
    created_by: User # owner of message
    created_at: Date # created date of message
    content: String # message text
  }

  # query for types
  type Query {
    # Return users
    users(text: String) : [User]

    # Return single user by its id
    currentUser: User

    # Return activities with text filter
    activities(text: String) : [Activity]

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
  }

  type Subscription {
    userAdded: User
    activityAdded: Activity
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
