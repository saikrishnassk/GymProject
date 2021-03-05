require('dotenv').config();

const {PORT,HOST} = process.env;
console.log(PORT);
module.exports = {
    port : PORT
};