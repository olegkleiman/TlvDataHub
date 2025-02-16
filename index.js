import { startApolloServer, startYogaServer } from "./server.js";

import { resolvers } from './resolvers/resolvers.js';
import { typeDefs } from './schemas/schema.js'

// startApolloServer(typeDefs, resolvers)
startYogaServer(typeDefs, resolvers)
