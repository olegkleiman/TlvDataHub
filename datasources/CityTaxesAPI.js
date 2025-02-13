class CityTaxesAPI {

    // Private fields
    #userId;

    constructor(userId) {

        this.#userId = userId
    }

    get taxes() {

        return ( async() => {

            const requestPayload = {
                "yitrotLakoach_Request_MT": 
                {
                    "misparZihuy": this.#userId,
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

        })();
    }
}

export default CityTaxesAPI;