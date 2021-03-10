require('dotenv').config();

const {PORT,ACCOUNTSID,AUTHTOKEN,MONGODB_URL,SQUARE_ACCESS_TOKEN} = process.env;
console.log(PORT);
module.exports = {
    port : PORT,
    accountSid : ACCOUNTSID,
    authToken : AUTHTOKEN,
    mongodb_url : MONGODB_URL,
    sqaure_access_token : SQUARE_ACCESS_TOKEN
};