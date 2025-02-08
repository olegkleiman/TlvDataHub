import RedisServer from './RedisServer.js'

class UserProfileAPI extends RedisServer {

    // Private fields
    #userId;
    #pictureData;

    constructor(userId) {

        super();

        this.#userId = userId
    }

    // Generally speaking, this is async property, but JS hasn't such things.
    // So we returing self-called async function instead. It looks like regular property
    get userPicture() {

        return (async() => {

            const redisClient = await this.createRedisClient();

            const key = `profiles:${this.#userId}`
            return await redisClient.hGet(key, 'profile_picture');
        })();
    }

    set userPicture(pictureData) {
   
        this.#pictureData = pictureData
        
        return (async() => {
            
            const redisClient = await this.createRedisClient();

            const key = `profiles:${this.#userId}`
            redisClient.hSet(key, {
                profile_picture: this.#pictureData
            })
        })(); 
     
    }
}

export default UserProfileAPI;