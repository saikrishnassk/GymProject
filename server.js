const express = require('express');
const config = require('./config');
require('dotenv').config();
const app = express();
const bodyParser = require('body-parser');
const { Client, Environment, ApiError } = require('square');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");
app.set("views",__dirname+"/views");

const accessToken = 'EAAAEEKvBjZ0AxwD0iM0eIIKtx8UvONW8rCAZQvPFARnD6iB4xKXUCKMJPG33jOB';

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/feedback",(req,res)=>{
    res.render("feedback");
});

app.post("/feedback",(req,res)=>{
    console.log(req.body);
    res.render("index");
});

app.get("/payment",(req,res)=>{
    res.render("payment");
});
const client = new Client({
    environment: Environment.Sandbox,
    accessToken: accessToken,
  });
  
  app.post('/process-payment', async (req, res) => {
    const requestParams = req.body;
  
    // Charge the customer's card
    console.log("Came here");
    console.log(client.paymentsApi,requestParams.nonce,requestParams);
    const paymentsApi = client.paymentsApi;
    const requestBody = {
      sourceId: requestParams.nonce,
      amountMoney: {
        amount: 100, // $1.00 charge
        currency: 'USD'
      },
      locationId: requestParams.location_id,
      idempotencyKey: requestParams.idempotency_key,
    };
  
    try {
        console.log("HaHasa");
      const response = await paymentsApi.createPayment(requestBody);
      console.log("Came here successfully");
      res.status(200).json({
        'title': 'Payment Successful',
        'result': response.result
      });
    } catch(error) {
      let errorResult = null;
      if (error instanceof ApiError) {
          console.log("here");
        errorResult = error.errors;
      } else {
        errorResult = error;
      }
      res.status(500).json({
        'title': 'Payment Failure',
        'result': errorResult
      });
    }
  });
  

const PORT = config.port; // OR const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Connected on ${PORT}`);
})