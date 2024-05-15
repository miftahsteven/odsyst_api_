const jwt = require("jsonwebtoken");
//const secret_key = "8888insyaAllahSukses";
const fs = require('fs');
var secret_key = fs.readFileSync('tobiznet.pem');

const generate = (payload) => {
  let token = jwt.sign(payload, secret_key, {
    expiresIn: "7d",
    algorithm: "RS256",
    issuer: "z3r0bytes",
  });

  return token;
};

const verify = (token) => {
  return jwt.verify(token, secret_key);
};

module.exports = {
  generate,
  verify,
};
