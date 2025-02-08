export const typeDefs = `#graphql

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
        userId: String,
        profilePicture: String
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
        me: User # MeResult
        cityTaxes: [TaxAccount]
        books: [Book]
    }

    type Mutation {
        setProfilePicture(base64: String) : Boolean
    }
`;