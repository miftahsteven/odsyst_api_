const ax = require('axios');
// const CryptoJS = require('crypto-js');

const sendImkas = async ({ nom, phone, desc, id }) => {
    // const timesg = String( + new Date);
    // const datas = {
    //     "amount": Number(nom),
    //     "customerPhone": phone,
    //     "desc": desc,
    //     "jurnalId": ID PROPOSAL ${id},
    //     "partnerCode": "ZISWAF",
    //     "productCode": "Top up - ZISWAF",
    //     "referenceNumber": "1000011"
    // }
    // const reqtrim = datas.replace(/[^a-zA-Z0-9\,:{}.]+/g,"").toUpperCase()+':'+timesg;
    // var hasreqq = CryptoJS.HmacSHA256(reqtrim, pm.variables.get('server-key'));
    // var signHex = CryptoJS.enc.Base64.stringify(hasreqq);
    // console.log(timesg);
    try {
        const response = await ax.post('https://imcash.pactindo.com/api/topup/postingDisbursement', {
            amount: Number(nom),
            customerPhone: phone,
            desc: desc,
            jurnalId: `ID PROPOSAL ${id}`,
            partnerCode: "ZISWAF",
            productCode: "Top up - ZISWAF",
            referenceNumber: "1000011"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Institution-ID': 'IMCASH',
                'Timestamp': '1508792287967',
                'Authorization': 'Basic WklTV0FG',
                'Signature': '2i5rlr51nlYchYnU+O5G0Q2xRhYxN33drpGpxFdiGko='
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