import UserProfileAPI from '../datasources/UserProfileAPI.js'
import ParkingAPI from '../datasources/ParkingAPI.js';
  
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

            const requestPayload = {
                "yitrotLakoach_Request_MT": 
                {
                    "misparZihuy": user.id,
                    "sugZihuy": 1
                }
            }

            const subscriptionKey = process.env.APIM_TAXES_SUBSCRIPTION_KEY;
            const url = process.env.CITY_TAXES_URL;

            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': subscriptionKey
                },
                body: JSON.stringify(requestPayload)
            });

            if( !resp.ok )
                throw new Error(`HTTP error! status: ${resp.status}`);

            const root = await resp.json();
            const taxes = root.yitrotLakoach_Response_MT

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

        },        

        parkingTickets: (parent, {ticketNumber}, {user}, info) => {
            const api = new ParkingAPI(parent.userId)
            return api.getTickets(ticketNumber)
        }
    }
};