import crypto from 'crypto';

class ParkingTicketsAPI {

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
            
            if( parseInt(tickets[0].returnCode) == 1 ) {
                // No tickets found
                if (process.env.NODE_ENV === 'DEMO' ) {
                    const _ticketNumber = ticketNumber ?? "1234567890"
                    const hash = crypto.createHash('sha256')
                                .update(_ticketNumber);
                    const lastDate = new Date();
                    lastDate.setFullYear(2025, 10, 22); // Nov., 22. Months are (0-based)

                    return [{   
                        id: hash.digest('hex'),
                        ticketNumber: _ticketNumber,
                        vehicleNumber: "123-456-78",
                        amount: "250.00",
                        issuedAt: "רחוב אבן גבירול 110, תל אביב",
                        issuedWhen: new Date(),
                        desc: "Parking violation description",
                        images: ['pla_2001371540_1_10x04x2024x07x29x16.JPG', 
                                'pla_2001371540_2_10x04x2024x07x29x17.JPG'],
                        lastPaymnetDate: lastDate
                    }]
                } else
                    return [];
            }

            const _tickets = tickets.map( item => {

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

export default ParkingTicketsAPI;