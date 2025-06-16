import crypto from 'crypto';

export default class PublicEventsAPI {
    // Private fields
    #userId;

    constructor(userId) {

        this.#userId = userId
    }

    encodeCursor(index) {
        return Buffer.from(index.toString()).toString('base64');
    }

    decodeCursor(cursor) {
        return parseInt(Buffer.from(cursor, 'base64').toString(), 10);
    }

    getEventsConnection(filter, first, after) {
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

            const startIndex = after ? decodeCursor(after) + 1 : 0;

            const edges = root.map((item, index) => {
                const hash = crypto.createHash('sha256');
                const id = hash.update(item.NewsNumber).digest('hex');

                const eventDate = Date.parse(item.Date);
                return {
                    cursor: this.encodeCursor(startIndex + index),
                    node: {
                        id: id,
                        name: item.Title,
                        description: item.Description,
                        address: item.Address,
                        date: eventDate,
                        image: item.MainPicture,
                        link: item.Link
                    }
                }
            })
            const _edges = edges.slice(startIndex, startIndex + first);

            return {
                totalCount: root.length,
                edges: _edges,
                pageInfo: {
                    hasNextPage: startIndex + first < root.length,
                    hasPreviousPage: startIndex > 0,
                    endCursor: _edges[_edges.length - 1].cursor || null,
                    startCursor:  _edges[0]?.cursor || null
                }   
            }
        })();
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
                const eventDate = Date.parse(item.Date);
                return {
                    name: item.Title,
                    description: item.Description,
                    address: item.Address,
                    date: eventDate,
                    image: item.MainPicture,
                    link: item.Link
                }
            });

            return _events;

        })();
    
    }  
}