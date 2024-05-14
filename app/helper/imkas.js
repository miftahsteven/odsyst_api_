const ax = require('axios');
const CryptoJS = require('crypto-js');

const sendImkas = async ({ nom, phone, desc, id }) => {
    const timesg = String(+ new Date);
    const datas = {
        "amount": Number(nom),
        "customerPhone": phone,
        "desc": desc,
        "jurnalId": `ID PROPOSAL ${id}`,
        "partnerCode": "ZISWAF",
        "productCode": "Top up - ZISWAF",
        "referenceNumber": "1000011"
    }
    const serverkey = 'wAEd3Jhc62KzDFtPw6fxw4PTbKPZiKvjtT1eW6FpxXQ='
    const reqtrim = JSON.stringify(datas).replace(/[^a-zA-Z0-9\,:{}.]+/g, "").toUpperCase() + ':' + timesg;
    var hasreq = CryptoJS.HmacSHA256(reqtrim, serverkey);
    var signHex = CryptoJS.enc.Base64.stringify(hasreq);
    console.log(timesg);
    try {
        const response = await ax.post('https://imcash.pactindo.com/api/topup/postingDisbursement',
            datas,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Institution-ID': 'IMCASH',
                    'Timestamp': timesg,
                    'Authorization': 'Basic WklTV0FG',
                    'Signature': signHex
                }
            });
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error.response.data);
        throw error;
    }
};

module.exports = {
    sendImkas,
};