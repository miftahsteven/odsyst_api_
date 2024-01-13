'use strict';
const fs = require('fs');
const jwt = require('jsonwebtoken');
var privateKEY  = fs.readFileSync('./app/helper/private.key', 'utf8');
var publicKEY  = fs.readFileSync('./app/helper/public.key', 'utf8');
/*
 ====================   JWT Signing =====================
*/

const generate = (payload) => {
        var i  = 'Ziswaf@Indosat';   
        var s  = 'msteven';   
        var a  = 'https://portal.zisindosat.id';
        var signOptions = {
            issuer:  i,
            subject:  s,
            audience:  a,
            expiresIn:  "12h",
            algorithm:  "RS256"   // RSASSA [ "RS256", "RS384", "RS512" ]
        };
        var token = jwt.sign(payload, privateKEY, signOptions);
        //console.log("Token :" + token);
        return token
}
/*
 ====================   JWT Verify =====================
*/

const verify = (token) => {
        var i  = 'Ziswaf@Indosat';   
        var s  = 'msteven';   
        var a  = 'https://portal.zisindosat.id';
        var verifyOptions = {
            issuer:  i,
            subject:  s,
            audience:  a,
            expiresIn:  "12h",
            algorithm:  ["RS256"]
        };
        var legit = jwt.verify(token, publicKEY, verifyOptions);
        //console.log("\nJWT verification result: " + JSON.stringify(legit));
        return legit
}

module.exports = {
    generate,
    verify,
};