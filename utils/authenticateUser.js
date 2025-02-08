import { GraphQLError } from 'graphql';
import { jwtDecode } from "jwt-decode";

export const authenticateUser = async (req) => {
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
    return user;
}