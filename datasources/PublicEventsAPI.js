export default class PublicEventsAPI {
    // Private fields
    #userId;

    constructor(userId) {

        this.#userId = userId
    }

    getEvents(filter, skip, take) {

        return ( async() => {

            var userId = this.#userId;
            const url = `${process.env.APIM_SEARCH_URL}/${filter}`;
            console.log(`Getting public events for user: ${userId} from URL: ${url}`);

            const resp = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': process.env.APIM_SEARCH_KEY
                }
            });
            if( !resp.ok )
                throw new Error(`HTTP error! status: ${resp.status}`);
            const root = await resp.json();
            
            const _events = root.slice(skip, take) .map((item) => {
                return {
                    name: item.Title,
                    description: item.Description,
                    address: item.Address
                }
            });

            return _events;

        })();
    
    }  
}