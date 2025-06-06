class ParkingAPI {

    // Private fields
    #userId;

    constructor(userId) {

        this.#userId = userId
    }

     getTickets (ticketNumber) {

        if( ticketNumber?.length > 10 )
            return null;

        return ( async() => {

            var authenticationType = 4;
            var userId = this.#userId;

            if( ticketNumber != null ) {
                userId = null
                authenticationType = 2
            } 

            const requestPayload = {
                digitelParkingPaymentsReports_Request_MT: {
                    reportNumber: ticketNumber ?? null, // undefined ?? null => null
                    carNumber: null, 
                    idNumber: userId,
                    idtype: "1",
                    authenticationType: authenticationType
                }
            }

            const subscriptionKey = process.env.APIM_PARKING_TICKETS_KEY;
            const url = process.env.PARKING_TICKETS_URL

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
            const tickets = root.DigitelParkingPaymentsReports_Response_MT;
            
            const _tickets = tickets.map( item => {
                if (parseInt(item.returnCode, 10) == 1 ) {
                    return {
                            id: 222,
                            ticketNumber: "11"
                    }

                }
                    // return null;

                return {
                    ticketNumber: item.reportNumber,
                    vehicleNumber: item.carNumber,
                    amount: item.outstandingBalance?.trim(),
                    issuedAt: item.offensePlace,
                    issuedWhen: `${item.offenseDate} ${item.offenseTime}`,
                    desc: item.ofenseParagraph,
                    images: item.reportImages,
                    lastPaymnetDate: item.lastPaymnetDate
                }
            })
            return _tickets;
        })();


    }
}

export default ParkingAPI;