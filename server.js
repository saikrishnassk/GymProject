const express = require('express');
const mongoose=require('mongoose');
const dateTime = require('date-time');
const config = require('./config');
require('dotenv').config();
const app = express();
const bodyParser = require('body-parser');
const { Client, Environment, ApiError } = require('square');

const accountSid = 'ACb88e41a85ce90b2eb05a4aeb8e406377'; 
const authToken = '7259b9d5b5812c033b24addc79c3f3ea'; 
const clientMsg = require('twilio')(accountSid, authToken); 
 
mongoose.set('useFindAndModify', false);
// const URI ="mongodb+srv://user1:user1@cluster0.fsrgc.mongodb.net/DBA_Project?retryWrites=true&w=majority"
const URI ="mongodb://user1:user1@cluster0-shard-00-00.fsrgc.mongodb.net:27017,cluster0-shard-00-01.fsrgc.mongodb.net:27017,cluster0-shard-00-02.fsrgc.mongodb.net:27017/DBA_Project?ssl=true&replicaSet=atlas-eo925u-shard-0&authSource=admin&retryWrites=true&w=majority"

const connectDB = async () =>{
    await mongoose.connect(URI,{ useUnifiedTopology: true,useNewUrlParser: true });
    console.log("db connected..!");
};
connectDB();

function ToCapitalize(arr){
  if(arr==='' || arr==undefined) return '';
  return arr.charAt(0).toUpperCase()+arr.slice(1);
}

const selfAssessmentSchema = new mongoose.Schema({
    FirstName:{
      type: String
    },
    LastName:{
      type: String
    },
    Questions:{
        type:Array
    },
    Answers:{
        type:Array
    },
    TimeStamp:{
        type:String
    }
  });
const SelfAssess = mongoose.model('SelfAssessment',selfAssessmentSchema);

const requestFormSchema = new mongoose.Schema({
    FirstName:{
        type:String
    },
    LastName:{
        type:String
    },
    Email:{
        type:String
    },
    Date:{
        type:String
    },
    Time:{
        type:String
    },
    Description:{
        type:String
    },
    TimeStamp:{
        type:String
    }
});
const RequestForm = mongoose.model('RequestForm',requestFormSchema);

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

app.get("/self_assessment",(req,res)=>{
    SelfAssess.find({}).then(data =>{
        console.log(data);
    })
    res.render("self_assessment");
});
app.get("/request_form",(req,res)=>{
    RequestForm.find({}).then(data =>{
        console.log(data);
    })
    res.render("request_form");
});

app.get("/feedback",(req,res)=>{
    res.render("feedback");
});

app.post("/feedback",(req,res)=>{
    console.log(req.body);
    res.render("index");
});
app.post("/self_assis",async (req,res)=>{
    console.log(req.body["q1_yes"]);
    let ele = {};
    console.log(dateTime());
    ele.FirstName = 'sai';
    ele.LastName = 'Krishna';
    const questions = ['Have you experienced any of the following symptoms in the past 48 hours: Fever or Chills, Cough, Shortness of breathing or difficulty breathing, fatigue, muscle or body aches, headache, loss of taste or smell, sore throat, congestion or runny nose, nausea or vomiting, diarrhe','Have you had close contact with a laboratory confirmed case of COVID-19 in the last 14 days?','Was your daily temperature self-screening greater than 100.4 degrees fahrenheit?'];
    const answers = [req.body["q1_yes"],req.body["q2_yes"],req.body["q3_yes"]];
    ele.Questions = questions;
    ele.Answers = answers;
    ele.TimeStamp = dateTime();
    let SelfAssessModel = new SelfAssess(ele);
    await SelfAssessModel.save();
    res.redirect("self_assessment");
});
app.post("/request_form",async (req,res)=>{
    console.log(req.body);
    let ele={};
    ele["FirstName"] = ToCapitalize(req.body["FirstName"]);
    ele["LastName"] = ToCapitalize(req.body["LastName"]);
    ele["Email"] = req.body["Email"];
    ele["Date"] = req.body["date"];
    ele["Time"] = req.body["time"];
    ele["Description"] = req.body["Description"];
    ele["TimeStamp"] = dateTime();
    let RequestFormModel = new RequestForm(ele);
    await RequestFormModel.save();
    console.log(ele.Time);
    clientMsg.messages 
      .create({ 
         body: `Hi Phani, \n${ele.FirstName}, ${ele.LastName} has signed in for a ${ele.Time} Appointment on ${ele.Date}`,  
         messagingServiceSid: 'MG5f300a9b2c0727c5ca3ed70d84ff9eb7',      
         to: '+12483257855' 
       }) 
      .then(message => console.log(message.sid)) 
      .done();
    res.redirect("request_form");
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
        amount: 100*requestParams.amount, // $1.00 charge
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