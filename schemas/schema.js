export const typeDefs = `#graphql

    #directive @defer(
    #     label: String
    #     if: Boolean
    # ) on FRAGMENT_SPREAD | INLINE_FRAGMENT

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
        cityTaxes: [TaxAccount]
        parkingTickets(ticketNumber: String): [ParkingTicket]
    }

    """An edge in a connection."""
    type UserParkingTicketEdge {
        """A cursor for use in pagination"""
        cursor: String!

        """The item at the end of the edge"""
        node: ParkingTicket
    }

    type Error {
        message: String!
    }

    type PageInfo {
        """When paginating forwards, the cursor to continue."""
        endCursor: String

        """When paginating forwards, are there more items?"""
        hasNextPage: Boolean!

        """When paginating backwards, are there more items?"""
        hasPreviousPage: Boolean!

        """When paginating backwards, the cursor to continue."""
        startCursor: String        
    }

    type UserParkingTicketConnection {
        edges: [UserParkingTicketEdge]
    
        pageInfo: PageInfo!
    }

    union MeResult = User | Error

    type TaxAccount implements Node {
        id: ID!
        city: String!
        amount: Float!
    }

    type ParkingTicket implements Node {
        id: ID!
        ticketNumber: String!
        vehicleNumber: String!
        amount: String!
        issuedAt: String
        issuedWhen: String!
        desc: String
        images: String
        pictures: [String!]!
        lastPaymnetDate: String
    }

    type Query {
        me: User # MeResult
        
        books: [Book]
    }

    type Mutation {
        setProfilePicture(base64: String) : Boolean
    }
`;