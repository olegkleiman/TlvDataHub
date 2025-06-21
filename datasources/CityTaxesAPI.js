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
                    "misparZihuy":  "072400534", //"300618287", // this.#userId,
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

            var accounts = taxes.netuneyCheshbonChoze.map( account => {

                const _account = {
                    accountNumber : account.misparCheshbonChoze,
                    street: `${account.shemHaRechov} ${account.misparHaBayit}`,
                    payments: account.perutYitrot.map( payment => {
                        console.info(payment)
                        return {
                            period: payment.teurChiyuv,
                            bill: payment.misparShovar,
                            amount: payment.yitratChovLeloShovarShotefKolelRibitAdkanit.trim()
                        }
                    })
                }

                return _account;
            })

            return accounts;
        })();
    }
}

export default CityTaxesAPI;