import { createClient } from 'redis';

class RedisServer {

    // Private fields
    #host;
    #url;

    constructor() {

        const host = process.env.REDIS_HOST
        this.#host = host
        const port = process.env.REDIS_PORT
        this.#url = `rediss://${host}:${port}`        
    }

    async createRedisClient() {

        const url = this.#url
        const host = this.#host

        const client = createClient({
            url,
            password: process.env.REDIS_PASSWORD,
            database: process.env.REDIS_DB_NUMBER,
            tls: {},
        })

        client.on('error', err => console.error(`Redis client error: ${err}`));
        client.on('connect', async () => {
            console.log(`Response from PING to ${host}: ${await client.ping()}\nConnected to redis server`)
        });

        await client.connect()
        
        return client
    }

}

export default RedisServer;