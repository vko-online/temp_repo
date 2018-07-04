import express from 'express'
import path from 'path'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import bodyParser from 'body-parser'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { apolloUploadExpress } from 'apollo-upload-server'
import { execute, subscribe } from 'graphql'
import jwt from 'express-jwt'
import jsonwebtoken from 'jsonwebtoken'
import mongoose from 'mongoose'

import { JWT_SECRET, MONGODB_URL, SEED } from './config'
import { User } from './models'
import { getSubscriptionDetails } from './subscriptions' // make sure this imports before executableSchema!
import { executableSchema } from './schema'
import { subscriptionApi } from './api'
import { userLoader } from './batch'

const GRAPHQL_PORT = 8080
const GRAPHQL_PATH = '/graphql'
const GRAPHQL_EXPLORER_PATH = '/graphiql'
const SUBSCRIPTIONS_PATH = '/subscriptions'

Error.stackTraceLimit = Infinity

const app = express()

app.use('/public', express.static(path.join(__dirname, '../public')))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// let Mongoose to use the global promise library
mongoose.Promise = global.Promise
mongoose.set('debug', true)
mongoose.connect(MONGODB_URL, (err) => {
  if (err) throw err

  // get the default connection
  const connection = mongoose.connection

  // bind connection to error event (to get notification of connection errors)
  connection.on('error', console.error.bind(console, 'MongoDB connection error:'))

  const seed = SEED === 'true' || false
  if (seed) {
    connection.db.dropDatabase()
    require('./seed')
  }
})

// `context` must be an object and can't be undefined when using connectors
app.use(
  '/graphql',
  bodyParser.json(),
  apolloUploadExpress({
    uploadDir: '/tmp/uploads'
  }),
  jwt({
    secret: JWT_SECRET,
    credentialsRequired: false
  }),
  graphqlExpress((req) => ({
    schema: executableSchema,
    context: {
      user: req.user
        ? User.findById(req.user.id)
        : Promise.resolve(undefined),
      userLoader: userLoader() // create a new dataloader for each request
    }
  }))
)

app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: GRAPHQL_PATH,
    subscriptionsEndpoint: `ws://localhost:${GRAPHQL_PORT}${SUBSCRIPTIONS_PATH}`
  })
)

const graphQLServer = createServer(app)

graphQLServer.listen(GRAPHQL_PORT, () => {
  console.log(
    `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}${GRAPHQL_PATH}`
  )
  console.log(
    `GraphQL Subscriptions are now running on ws://localhost:${GRAPHQL_PORT}${SUBSCRIPTIONS_PATH}`
  )
  console.log(
    `GraphQL Explorer is now running on http://localhost:${GRAPHQL_PORT}${GRAPHQL_EXPLORER_PATH}`
  )
})

// eslint-disable-next-line no-unused-vars
SubscriptionServer.create(
  {
    schema: executableSchema,
    execute,
    subscribe,
    onConnect (connectionParams) {
      const userPromise = new Promise((resolve, reject) => {
        if (connectionParams.jwt) {
          jsonwebtoken.verify(
            connectionParams.jwt,
            JWT_SECRET,
            (err, decoded) => {
              if (err) {
                reject(new Error('Invalid Token'))
              }

              resolve(User.findById(decoded.id))
            }
          )
        } else {
          reject(new Error('No Token'))
        }
      })

      return userPromise.then(user => {
        if (user) {
          return { user: Promise.resolve(user) }
        }

        return Promise.reject(new Error('No User'))
      })
    },
    onOperation (parsedMessage, baseParams) {
      console.log('parsedMessage', parsedMessage)
      // we need to implement this!!!
      const { subscriptionName, args } = getSubscriptionDetails({
        baseParams,
        schema: executableSchema
      })

      // we need to implement this too!!!
      return subscriptionApi[subscriptionName](
        baseParams,
        args,
        baseParams.context
      )
    }
  },
  {
    server: graphQLServer,
    path: SUBSCRIPTIONS_PATH
  }
)
