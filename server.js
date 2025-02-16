import 'dotenv/config'

// Apollo
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// Yoga
import { createSchema, createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream';

import { authenticateUser } from './utils/authenticateUser.js';

// const { url } = 
export async function startApolloServer(typeDefs, resolvers) {

    // The ApolloServer constructor requires two parameters: your schema
    // definition and your set of resolvers.
    // 'debug' and 'includeStacktraceInErrorResponses' parameters are optional
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        degug: true,
        introspection: true,
        includeStacktraceInErrorResponses: false // see: https://www.apollographql.com/docs/apollo-server/data/errors
    });

    // Passing an ApolloServer instance to the `startStandaloneServer` function:
    //  1. creates an Express app
    //  2. installs your ApolloServer instance as middleware
    //  3. prepares your app to handle incoming requests
    const PORT = process.env.PORT;
    console.log(`Port from env: ${process.env.PORT}`)
    console.log(`Env: ${process.env.NODE_ENV}`)

    await startStandaloneServer(server, {
        listen: { port: PORT },
        context: async ({ req, res }) => {

            const user = await authenticateUser(req)
            // add the user to the context
            return { user };

        }
    })

};  

export async function startYogaServer(typeDefs, resolvers) {
    const yoga = createYoga({
        schema: createSchema({
          typeDefs,
          resolvers
        }),
        context: async ({ req, res }) => {
            const user = await authenticateUser(req)
            // add the user to the context
            return { user };
        },
        plugins: [useDeferStream()]
      })

      const server  = createServer(yoga)

      const PORT = process.env.PORT;
      console.log(`Port from env: ${process.env.PORT}`)
      console.log(`Env: ${process.env.NODE_ENV}`)

      server.listen(PORT, () => {
        console.info(`Server is running on http://localhost:${PORT}/graphql`)
    }) 
}