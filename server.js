//import express from "express"
import { createHandler } from "graphql-http/lib/use/express"
import { buildSchema } from "graphql"
import { ruruHTML } from "ruru/server"

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

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
        cityTaxes(id: String!): [TaxAccount]
        books: [Book]
        
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
    MeResult: {
        __resolveType(obj, context, info) {
            if( 'name' in obj ) {
                return 'User';
            }

            return null; // throw GraphQLError
        }
    },
    Query: {
      books: () => books,
      cityTaxes: async (_, {id}) => {   
        
        const requestPayload = {
            "yitrotLakoach_Request_MT": 
            {
                "misparZihuy": "300618287", // "054008222"
                "sugZihuy": 1
            }
        }

        const resp = await fetch(`https://apimtlvppr.tel-aviv.gov.il/PPR/DigitelYitrotLakoach_OB`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': '375a40ed1e0a467fbe809de970eb89c9'
            },
            body: JSON.stringify(requestPayload)
        });

        if( !resp.ok )
            throw new Error(`HTTP error! status: ${resp.status}`);

        const taxes = await resp.json();

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
const server = new ApolloServer({
    typeDefs,
    resolvers,
    degug: true
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });  
