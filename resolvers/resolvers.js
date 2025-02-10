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

        }
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

        parkingTickets: (parent, args, {user}, info) => {
            const api = new ParkingAPI(parent.userId)
            return api.tickets
        }
    }
};