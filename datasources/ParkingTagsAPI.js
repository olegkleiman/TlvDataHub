import crypto from 'crypto';

export default class ParkingTagsAPI {
        // Private fields
    #userId;

    constructor(userId) {

        this.#userId = userId
    }


    getTags() {

        return ( async() => {

            // if (process.env.NODE_ENV === 'DEMO' ) {
            //     //const hash = crypto.createHash('sha256')

            //     const tags = [];
            //     let tagNumber = "1234567890";
            //     const expirationDate = new Date();
            //     expirationDate.setFullYear(2025, 10, 22); // Nov., 22. Months are (0-based)
            //     const hash = crypto.createHash('sha256')
            //     tags.push({
            //             id: hash.update(tagNumber).digest('hex'),
            //             tagNumber: tagNumber,
            //             vehicleNumber: "123-456-789",
            //             parkingAreas: ["איזור 5"],
            //             application: "Cellopark",
            //             tagType: "Disabilities",
            //             status: "Active",
            //             expirationDate: expirationDate
            //     });

            //     tagNumber = "0987654321";
            //     const hash2 = crypto.createHash('sha256');
            //     tags.push({
            //             id: hash2.update(tagNumber).digest('hex'),
            //             tagNumber: tagNumber,
            //             vehicleNumber: "123-456-789",
            //             parkingAreas: ["איזור 1", "איזור 2", "איזור 3"],
            //             application: "Cellopark",
            //             tagType: "Regular",
            //             status: "Active",
            //             expirationDate: "2025-12-31"
            //     });

            //     return tags;
            // }
            // else {
                var userId = this.#userId;
                const requestPayload = {
                    RequestForParkingTagsByIDNumber_Request_MT : {
                        RequestForParkingTagsByIDNumber: {
                            "IdType": "FS0001",
                            "IdNumber": "005260286" // userId
                        }
                    }
                };

               const url = process.env.APIM_PARKING_TAGS_URL;
               const subscriptionKey = process.env.APIM_PARKING_TAGS_KEY;

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
               const tags = root.RequestForParkingTagsByIDNumber_Response_MT.ResponseForParkingTagsByIDNumber;

               const _tags = tags.map(item => {
                    
                    const hash = crypto.createHash('sha256');
                    const id = hash.update(item.TavNumber).digest('hex');

                    const expirationDate = new Date();
                    const expirationYear= item.ToDate.substring(0, 4);
                    const expirationMonth = item.ToDate.substring(4, 6) - 1; // Months are 0-based in JavaScript
                    const expirationDay = item.ToDate.substring(6, 8);
                    expirationDate.setFullYear(expirationYear, expirationMonth, expirationDay);
                    expirationDate.setHours(0, 0, 0, 0);
                    return {
                        id: id,
                        tagNumber: item.TavNumber,
                        vehicleNumber: item.PlateNumber,
                        parkingAreas: [item.ParkingArea],
                        geographicArea: item.ParkingArea,
                        address: `${item.Street2} ${item.HouseNumber}`,
                        expirationDate: expirationDate,
                    }
               });
               return _tags;

        })();
    
    }   
}