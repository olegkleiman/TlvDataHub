import { setTimeout as setTimeout$ } from 'node:timers/promises'
import { v4 as uuidv4 } from 'uuid'

import UserProfileAPI from '../datasources/UserProfileAPI.js'
import ParkingTicketsAPI from '../datasources/ParkingTicketsAPI.js';
import ParkingTagsAPI from '../datasources/ParkingTagsAPI.js';
import CityTaxesAPI from '../datasources/CityTaxesAPI.js';
import PublicEventsAPI from '../datasources/PublicEventsAPI.js';
import { dateScalar } from '../DateScalar.js';

const books = [
    { id: 1, title: '1984', author: 'George Orwell' },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee' },
    { id: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
    { id: 4, title: 'The Catcher in the Rye', author: 'J.D. Salinger' },
    { id: 5, title: 'Pride and Prejudice', author: 'Jane Austen' },
    { id: 6, title: 'The Hobbit', author: 'J.R.R. Tolkien' },
    { id: 7, title: 'Fahrenheit 451', author: 'Ray Bradbury' },
    { id: 8, title: 'Brave New World', author: 'Aldous Huxley' },
]

import { DefaultAzureCredential } from'@azure/identity';
const credential = new DefaultAzureCredential();

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
        me: (_, args, {user}) => user,
        
    },
    Book: {
        author: (parent) => {

            const res = books.find(book => book.author.includes(parent.author));
            return {
                id: uuidv4(),
                name: res.author
            }
        },
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
        // books: (_, args) => {
        //     return books
        // },
        interests: (parent, args, {user}, info) => {
            return["books", "movies", "music"]
        },

        // publicEvents: async (parent, {filter, skip, take}, {user}, info) => {
        //     const api = new PublicEventsAPI(user.userId)
        //     return await api.getEvents(filter, skip, take)
        // },

        publicEventsConnection: async (parent, {filter, first, after, last, before}, {user}, info) => {
            const api = new PublicEventsAPI(user.userId)
            return await api.getEventsConnection(filter, first, after, last, before)
        },

        profilePicture(parent) {
            const api = new UserProfileAPI(parent.userId)
            return api.userPicture
        },

        cityTaxes: async (_, args, {user}, info) => {   
            const api = new CityTaxesAPI(user.userId)
            return api.taxes
        },        

        parkingTickets: async (parent, {ticketNumber}, {user}, info) => {

            //const token = await credential.getToken("https://database.windows.net/")

            const api = new ParkingTicketsAPI(user.userId)
            const tickets = await api.getTickets(ticketNumber)
            return tickets;
        },

        parkingTags: async (parent, args, {user}, info) => {

            const api = new ParkingTagsAPI(user.userId)
            const tags = await api.getTags()
            return tags;
        }
    },

    ParkingTicket: {
        async *images(parent, args, {user}, info) {
            const imagesURL = process.env.PARKING_IMAGES_URL;
            for (const imageName of parent.images) {
              yield imagesURL+imageName
              //await setTimeout$(50)
            }
          },
    }
};