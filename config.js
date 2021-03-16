require('dotenv').config();

const {PORT,ACCOUNTSID,AUTHTOKEN,MONGODB_URL_1,SQUARE_ACCESS_TOKEN,SEND_GRID_API} = process.env;
console.log(PORT);
module.exports = {
    port : PORT,
    accountSid : ACCOUNTSID,
    authToken : AUTHTOKEN,
    mongodb_url : MONGODB_URL_1,
    sqaure_access_token : SQUARE_ACCESS_TOKEN,
    send_grid_api:SEND_GRID_API
};