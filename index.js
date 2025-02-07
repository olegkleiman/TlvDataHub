//import express from "express"
import { createHandler } from "graphql-http/lib/use/express"
import { buildSchema } from "graphql"
import { ruruHTML } from "ruru/server"
import 'dotenv/config'
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLError } from 'graphql';
import { jwtDecode } from "jwt-decode";
import { createClient } from 'redis';

const typeDefs = `#graphql

    scalar Date

    # An object with a Globally Unique ID
    interface Node {
        id: ID!
    }

    type Book implements Node {
        id: ID!
        title: String!
        author: String
    }

    type User {
        name: String
        email: String
        phoneNumber: String
        userId: String
    }

    type Error {
        message: String!
    }

    union MeResult = User | Error

    type TaxAccount implements Node{
        id: ID!
        city: String!
        amount: Float!
    }

    type Query {
        me: MeResult
        cityTaxes: [TaxAccount]
        books: [Book]
        
    }

    type Mutation {
        setProfilePicture(base64: String) : Boolean
    }
`;
 
const books = [
    {
        id: 1,
        title: 'The Awakening',
        author: 'Kate Chopin',
    },
    {
        id: 2,
        title: 'City of Glass',
        author: 'Paul Auster',
    },
  ];

const resolvers = {
    Mutation: {
        setProfilePicture: async (_, {base64}, {user}, info) => {
            try {

                const host = process.env.REDIS_HOST
                const port = process.env.REDIS_PORT
                const url = `rediss://${host}:${port}`

                // Connect to Redis client.
                // See https://github.com/redis/node-redis/blob/master/docs/client-configuration.md
                const redisClient = createClient({
                    url,
                    password: process.env.REDIS_PASSWORD,
                    database: process.env.REDIS_DB_NUMBER,
                    tls: {},
                })
                redisClient.on('error', err => {
                    console.error('Redis client error', err)
                })
                redisClient.on('connect', () => {
                    console.log('Connected to redis server')
                });

                await redisClient.connect()

                console.log(`Response from PING: ${await redisClient.ping()}`)

                redisClient.hSet(`profiles:${user.userId}`, {
                    profile_picture: base64
                })

            } catch(ex) {
                console.error(ex.message)
            }

            return true
        }
    },
    MeResult: {
        __resolveType(obj, context, info) {

            if( 'name' in obj ) {
                return 'User';
            }

            return 'Error'; // throw GraphQLError
        }
    },
    Query: {
        books: () => books,
        me: (_, args, {user}, info) => {
            return user
        },
        cityTaxes: async (_, args, {user}, info) => {   

            const requestPayload = {
                "yitrotLakoach_Request_MT": 
                {
                    "misparZihuy": user.id,
                    "sugZihuy": 1
                }
            }

            var subscriptionKey = process.env.APIM_TAXES_SUBSCRIPTION_KEY;

            const resp = await fetch(`https://apimtlvppr.tel-aviv.gov.il/PPR/DigitelYitrotLakoach_OB`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': subscriptionKey
                },
                body: JSON.stringify(requestPayload)
            });

            if( !resp.ok )
                throw new Error(`HTTP error! status: ${resp.status}`);

            const taxes = await resp.json();
            const respRoot = taxes.yitrotLakoach_Response_MT

            return [
                    {
                        id: 1,
                        city: 'New York',
                        amount: 1000
                    },
                    {
                        id: 2,
                        city: 'San Francisco',
                        amount: 2000
                    }
            ];

        }
    } 
};
 
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
// 'debug' parameter is optional
const server = new ApolloServer({
    typeDefs,
    resolvers,
    degug: true,
    includeStacktraceInErrorResponses: false // see: https://www.apollographql.com/docs/apollo-server/data/errors
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req, res }) => {
        // get the user token from the headers
        const authHeader = req.headers.authorization || '';
        const token = authHeader && authHeader.split(' ')[1];
        if( token === '') {
            throw new GraphQLError('No JWT passed', {
                extensions: {
                    code: 'Unauthorized',
                    http: {
                        status: 401
                      }
                }
            })
        }

        const validationRequestBody = {
            clientId: process.env.CLIENT_ID
        }

        // try {

            const resp = await fetch("https://api.tel-aviv.gov.il/sso/validate_token", {
                method: 'POST',
                body: JSON.stringify(validationRequestBody),
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token 
                }
            })

            if( !resp.ok ) {
                const errorJson = await resp.json()
                const errorMessage = errorJson.developerMessage
                console.error("Unable to validate passed JWT: " + errorMessage);
                throw new GraphQLError(errorMessage, {
                    extensions: {
                      code: 'Unauthorized',
                      http: {
                        status: 401
                      }
                    }
                })
            }

            // At this point JWT is validated
            // let's see its claims
            const claims = jwtDecode(token);
            const scope = claims.scp

            const user = await resp.json();
            // add the user to the context
            return { user };
        // } 
        // catch (ex) {
        //     console.error(ex.message)
        // }
    }
  });  
