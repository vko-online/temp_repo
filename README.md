# Activity server

Create `.env` file with

    SEED=true
    JWT_SECRET=123
    MONGODB_URL=mongodb://127.0.0.1:27017/dakota_dev
    
Make sure you have mongo service running

    ❯ mongo
    MongoDB shell version v3.6.4
    connecting to: mongodb://127.0.0.1:27017
    MongoDB server version: 3.6.4


Install packages

    ❯ yarn start

Start server

    ❯ yarn start
    yarn run v1.3.2
    $ babel-node src/main.js --presets es2015,stage-2
    GraphQL Server is now running on http://localhost:8080/graphql
    GraphQL Subscriptions are now running on ws://localhost:8080/subscriptions
    GraphQL Explorer is now running on http://localhost:8080/graphiql
    {5b222d3b6367bb892f02cece, 8885555512, 1}
    {5b222d3c6367bb892f02cecf, 5557664823, 1}
    {5b222d3d6367bb892f02ced0, 8882313123, 1}
    {5b222d3d6367bb892f02ced1, 5556106679, 1}
    {5b222d3e6367bb892f02ced2, 5555228243, 1}
    {5b222d416367bb892f02ced3, 1236106645, 1}
    {5b222d416367bb892f02ced4, 5555648583, 1}
    {5b222d416367bb892f02ced5, 5554787672, 1}
