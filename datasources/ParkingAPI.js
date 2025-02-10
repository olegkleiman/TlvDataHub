class ParkingAPI {

    // Private fields
    #userId;

    constructor(userId) {

        this.#userId = userId
    }

     get tickets () {

        return ( async() => {

            const requestPayload = {
                digitelParkingPaymentsReports_Request_MT: {
                    reportNumber: null,
                    carNumber: null,
                    idNumber: this.#userId, //  "054008222", // "213249337", 
                    idtype: "1",
                    authenticationType: "4"
                }
            }

            const subscriptionKey = process.env.APIM_PARKING_TICKETS_KEY;

            const resp = await fetch(`https://apimtlvppr.tel-aviv.gov.il/qa/payments-reports`, {
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
                return {
                    ticketNumber: item.reportNumber,
                    vehicleNumber: item.carNumber,
                    amount: item.outstandingBalance.trim(),
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