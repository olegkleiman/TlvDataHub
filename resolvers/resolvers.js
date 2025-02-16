import { setTimeout as setTimeout$ } from 'node:timers/promises'

import UserProfileAPI from '../datasources/UserProfileAPI.js'
import ParkingAPI from '../datasources/ParkingAPI.js';
import CityTaxesAPI from '../datasources/CityTaxesAPI.js';
  
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

  // Resolver map
export const resolvers = {
    Mutation: {
        setProfilePicture: async (_, {base64}, {user}, info) => {

            const api = new UserProfileAPI(user.userId)
            api.userPicture = base64

            return true
        }
    },

    Query: {
        books: () => books,
        me: (_, args, {user}) => user,
    },
    MeResult: {
        __resolveType(obj, context, info) {

            if( 'name' in obj ) {
                return 'User';
            }

            return 'Error'; // throw GraphQLError
        },
    },
    User: {

        profilePicture(parent) {
            const api = new UserProfileAPI(parent.userId)
            return api.userPicture
        },

        cityTaxes: async (_, args, {user}, info) => {   
            const api = new CityTaxesAPI(user.userId)
            return api.taxes
        },        

        parkingTickets: async (parent, {ticketNumber}, {user}, info) => {
            await setTimeout$(2000); // Simulate delay
            const api = new ParkingAPI(parent.userId)
            return api.getTickets(ticketNumber)    
        }
    }
};