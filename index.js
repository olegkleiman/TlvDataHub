import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

// General GraphQL
import { loadSchema } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'

const typeDefs = await loadSchema(path.join(__dirname, './schemas/schema.graphql'), {
    loaders: [new GraphQLFileLoader()]
})

import { startApolloServer, startYogaServer } from "./server.js";

import { resolvers } from './resolvers/resolvers.js';
// import { typeDefs } from './schemas/schema.js'

// startApolloServer(typeDefs, resolvers)
startYogaServer(typeDefs, resolvers)
