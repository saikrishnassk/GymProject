const express = require('express');
const mongoose=require('mongoose');
const dateTime = require('date-time');
const config = require('./config');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
require('dotenv').config();
let cron = require('node-cron');
const app = express();
const bodyParser = require('body-parser');
const { Client, Environment, ApiError } = require('square');

const accountSid = `${config.accountSid}`; 
const authToken = `${config.authToken}`;

const clientMsg = require('twilio')(accountSid, authToken);

 
mongoose.set('useFindAndModify', false);
const URI =`${config.mongodb_url}`;

const connectDB = async () =>{
    await mongoose.connect(URI,{ useUnifiedTopology: true,useNewUrlParser: true });
    console.log('db connected..!');
};
connectDB();

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'self_assessment_report.csv',
    header: [
        {id: 'name', title: 'NAME'},
        {id: 'question1', title: 'Have you experienced any of the following symptoms in the past 48 hours: Fever or Chills, Cough, Shortness of breathing or difficulty breathing, fatigue, muscle or body aches, headache, loss of taste or smell, sore throat, congestion or runny nose, nausea or vomiting, diarrhe'},
        {id: 'question2', title: 'Have you had close contact with a laboratory confirmed case of COVID-19 in the last 14 days?'},
        {id: 'question3', title: 'Was your daily temperature self-screening greater than 100.4 degrees fahrenheit?'},
        {id: 'date', title: 'DATE'}
    ]
});
const csvWriter1 = createCsvWriter({
  path: 'payment_report.csv',
  header: [
      {id: 'name', title: 'NAME'},
      {id: 'amount', title: 'AMOUNT'},
      {id: 'date', title: 'DATE'},
      {id: 'note', title: 'NOTE'}
  ]
});
const csvWriter2 = createCsvWriter({
  path: 'request_form_report.csv',
  header: [
    {id: 'firstname', title: 'FIRST NAME'},
    {id: 'lastname', title: 'LAST NAME'},
    {id: 'email', title: 'EMAIL'},
    {id: 'phone', title: 'PHONE'},
    {id: 'isInGym', title: 'Is In Gym'},
    {id: 'time', title: 'TIME'},
    {id: 'date', title: 'DATE'},
    {id: 'description', title: 'DESCRIPTION'},
    {id: 'paymentMode', title: 'PAYMENT MODE'},
    {id: 'createdOn', title: 'CREATED ON'}
  ]
});
function ToCapitalize(arr){
  if(arr==='' || arr===undefined) {return '';}
  return arr.charAt(0).toUpperCase()+arr.slice(1).toLowerCase();
}

function CreateTextMessage(data, isCovid = false){
  if(data && data.Ingym === "Yes" && isCovid){
    try{
      clientMsg.messages
          .create({
              body: `Hello, 
              \n${data.FirstName}, ${data.LastName} has Covid symptoms and requested service for ${data.Description}. Contact info : +1${data.Phone}`,
              messagingServiceSid: 'MG7bbd293395a80dfa3871da1f90050c34',
              to: '+13132932246'
          })
          .then(message => console.log(message.sid))
          .done();
    }
    catch(error){
      console.log('Failed to send message!!!');
    }
      return 'true';
  }
  else if(data && data.Ingym === "Yes"){
    try{
      clientMsg.messages
          .create({
              body: `Hello, 
              \n${data.FirstName}, ${data.LastName} has requested service for ${data.Description}. Contact info : +1${data.Phone}`,
              messagingServiceSid: 'MG7bbd293395a80dfa3871da1f90050c34',
              to: '+13132932246'
          })
          .then(message => console.log(message.sid))
          .done();
    }
    catch(error){
      console.log('Failed to send message!!!');
    }
      return 'true';
  }
  else if(data){
    try{
      clientMsg.messages
          .create({
              body: `Hello, 
              \n${data.FirstName}, ${data.LastName} has signed in for a ${data.Time} Appointment on ${data.Date} requested service for ${data.Description}. Contact info : +1${data.Phone}`,
              messagingServiceSid: 'MG7bbd293395a80dfa3871da1f90050c34',
              to: '+13132932246'
          })
          .then(message => console.log(message.sid))
          .done();
    }
    catch(error){
      console.log('Failed to send message!!!');
    }
      return 'true';
  }
  else {
      return 'false';
  }
}
function CreateTextMessage1(data){
  if(data){
    try{
      clientMsg.messages
          .create({
              body: `
              ${data.Name} Made a $${data.Amount} payment, Note: ${data.Note}`,
              messagingServiceSid: 'MG7bbd293395a80dfa3871da1f90050c34',
              to: '+13132932246'
          })
          .then(message => console.log(message.sid))
          .done();
    }
    catch(error){
      console.log('Failed to send message!!!');
    }
      return 'true';
  }
  else {
      return 'false';
  }
}
function CreateTextMessageCovid(data){
  if(data){
    try{
      clientMsg.messages
          .create({
              body: `
              ${data.Name} has selected "Yes" in one of the questions in the COVID self-assessment`,
              messagingServiceSid: 'MG7bbd293395a80dfa3871da1f90050c34',
              to: '+13132932246'
          })
          .then(message => console.log(message.sid))
          .done();
    }
    catch(error){
      console.log('Failed to send message!!!');
    }
      return 'true';
  }
  else {
      return 'false';
  }
}
const selfAssessmentSchema = new mongoose.Schema({
    Name:{
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
    Phone:{
      type:Number
    },
    IsInGym:{
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
    PaymentMode:{
      type:String
    },
    TimeStamp:{
        type:String
    }
});
const RequestForm = mongoose.model('RequestForm',requestFormSchema);

const paymentFormSchema = new mongoose.Schema({
  Name:{
      type:String
  },
  Amount:{
      type:Number
  },
  TimeStamp:{
      type:String
  },
  Note:{
    type:String
  }
});
const PaymentForm = mongoose.model('PaymentForm',paymentFormSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(express.static(__dirname+'/public'));
app.set('view engine','ejs');
app.set('views',__dirname+'/views');

const accessToken = `${config.sqaure_access_token}`;

app.get('/',(req,res)=>{
    res.redirect('https://www.pushthelimitfit.com/');
});
app.get('/self_assessment',(req,res)=>{
    res.render('self_assessment');
});
app.get('/request_form',(req,res)=>{
    res.render('request_form');
});

app.get('/feedback',(req,res)=>{
    res.render('feedback');
});

const transporter = nodemailer.createTransport(sendgridTransport(
  {
    auth:{
      api_key: `${config.send_grid_api}`
    }
  }
));

function compare_name(a, b) {
  const bandA = a.name.toUpperCase();
  const bandB = b.name.toUpperCase();
  let comparison = 0;
  if (bandA > bandB) {
    comparison = 1;
  } else if (bandA < bandB) {
    comparison = -1;
  }
  return comparison;
}
function compare_name1(a, b) {
  const bandA = a.firstname.toUpperCase();
  const bandB = b.firstname.toUpperCase();
  let comparison = 0;
  if (bandA > bandB) {
    comparison = 1;
  } else if (bandA < bandB) {
    comparison = -1;
  }
  return comparison;
}
cron.schedule('0 0 10 5 1-12 *', ()=>{
  console.log('Hi there');
  let records = [];
  SelfAssess.find({}).then(data =>{
    for(var i=0;i<data.length;i++){
      let element_row={};
      element_row['name']=data[i]['Name'];
      element_row['question1']=data[i]['Answers'][0];
      element_row['question2']=data[i]['Answers'][1];
      element_row['question3']=data[i]['Answers'][2];
      element_row['date']=data[i]['TimeStamp'].slice(0,10);
      records.push(element_row);
    }  
  }).then(data1 =>{
    records.sort(compare_name);
    console.log(records);
    csvWriter.writeRecords(records)       // returns a promise
    .then(() => {
        console.log('...Done');
    });

  })
  .then(data2 =>{
    transporter.sendMail({
      to: 'ptlfitnessllc@gmail.com',
      from: 'pushthelimitfit@gmail.com',
      subject: 'Report for health assessment',
      html: '<p>Hello,</p><br><p>This report contains all data of health assessment</p>',
      text: 'Hello,\nThis report contains all data of health assessment',
      attachments: [{
        filename: 'self_assessment_report.csv', path: './self_assessment_report.csv'
      }]
    }).then(data =>{
      console.log('Sent mail sucessfully!!',data);
      SelfAssess.deleteMany({}, (result) =>{
        console.log(result);
      });
    }).catch(err =>{
      console.log('Error in sending : ',err);
    });
  });
}, {
  scheduled: true,
  timezone: 'America/Detroit'
})

cron.schedule('0 1 10 5 1-12 *', ()=>{
  console.log('Hi there');
  let records = [];
  RequestForm.find({}).then(data =>{
    for(var i=0;i<data.length;i++){
      let element_row={};
      element_row['firstname']=data[i]['FirstName'];
      element_row['lastname']=data[i]['LastName'];
      element_row['email']=data[i]['Email'];
      element_row['phone']=data[i]['Phone'];
      element_row['isInGym']=data[i]['IsInGym'];
      element_row['time']=data[i]['Time'];
      element_row['date']=data[i]['Date'];
      element_row['description']=data[i]['Description'];
      element_row['paymentMode']=data[i]['PaymentMode'];
      element_row['createdOn']=data[i]['TimeStamp'];
      records.push(element_row);
    }  
  }).then(data1 =>{
    records.sort(compare_name1);
    console.log(records);
    csvWriter2.writeRecords(records)       // returns a promise
    .then(() => {
        console.log('...Done');
    });

  })
  .then(data2 =>{
    transporter.sendMail({
      to: 'ptlfitnessllc@gmail.com',
      from: 'pushthelimitfit@gmail.com',
      subject: 'Report for Request form',
      html: '<p>Hello,</p><br><p>This report contains all data of Scheduled Requests</p>',
      text: 'Hello,\nThis report contains all data of Scheduled Requests',
      attachments: [{
        filename: 'request_form_report.csv', path: './request_form_report.csv'
      }]
    }).then(data =>{
      console.log('Sent mail sucessfully!!',data);
      RequestForm.deleteMany({}, (result) =>{
        console.log(result);
      });
    }).catch(err =>{
      console.log('Error in sending : ',err);
    });
  });
}, {
  scheduled: true,
  timezone: 'America/Detroit'
})

cron.schedule('0 2 10 5 1-12 *', ()=>{
  console.log('Hi there');
  let records = [];
  PaymentForm.find({}).then(data =>{
    for(var i=0;i<data.length;i++){
      let element_row={};
      element_row['name']=data[i]['Name'];
      element_row['amount']=data[i]['Amount'];
      element_row['date']=data[i]['TimeStamp'].slice(0,10);
      element_row['note']=data[i]['Note'];
      records.push(element_row);
    }  
  }).then(data1 =>{
    records.sort(compare_name);
    console.log(records);
    csvWriter1.writeRecords(records)       // returns a promise
    .then(() => {
        console.log('...Done1');
    });

  })
  .then(data2 =>{
    transporter.sendMail({
      to: 'ptlfitnessllc@gmail.com',
      from: 'pushthelimitfit@gmail.com',
      subject: 'Report for payments',
      html: '<p>Hello,</p><br><p>This report contains all data of successful payments</p>',
      text: 'Hello,\nThis report contains all data of successful payments',
      attachments: [{
        filename: 'payment_report.csv', path: './payment_report.csv'
      }]
    }).then(data =>{
      console.log('Sent mail sucessfully!!',data);
      PaymentForm.deleteMany({}, (result) =>{
            console.log(result);
        });
    }).catch(err =>{
      console.log('Error in sending : ',err);
    });
  });
}, {
  scheduled: true,
  timezone: 'America/Detroit'
})


app.post('/feedback',(req,res)=>{
    res.render('index');
});
app.post('/self_assis',async (req,res)=>{

    let data = {};

    data.Name = ToCapitalize(req.body['Name']);
    const questions = ['Have you experienced any of the following symptoms in the past 48 hours: Fever or Chills, Cough, Shortness of breathing or difficulty breathing, fatigue, muscle or body aches, headache, loss of taste or smell, sore throat, congestion or runny nose, nausea or vomiting, diarrhe','Have you had close contact with a laboratory confirmed case of COVID-19 in the last 14 days?','Was your daily temperature self-screening greater than 100.4 degrees fahrenheit?'];
    const answers = [req.body['q1_yes'],req.body['q2_yes'],req.body['q3_yes']];
    data.Questions = questions;
    data.Answers = answers;
    data.TimeStamp = dateTime();
    let SelfAssessModel = new SelfAssess(data);
    await SelfAssessModel.save();
    transporter.sendMail({
      to: 'ptlfitnessllc@gmail.com',
      from: 'pushthelimitfit@gmail.com',
      subject: 'Covid Self assessment',
      html: `<p>${data.Name}’s Covid self assessment</p><br><p>Option 1 : ${data.Answers[0]}</p><br><p>Option 2 : ${data.Answers[1]}</p><br><p>Option 3 : ${data.Answers[2]}</p>`,
      text: `${data.Name}\nOption 1 : ${data.Answers[0]}\nOption 2 : ${data.Answers[1]}\nOption 3 : ${data.Answers[2]}`
    }).then(data =>{
      console.log('Sent mail successfully!!',data);
    }).catch(err =>{
      console.log('Error in sending : ',err);
    });
    for(var i=0;i<data.Answers.length;i++){
      if(data.Answers[i] === 'Yes' ){
        CreateTextMessageCovid(data);
        break;
      }
    }
    res.redirect('self_assessment');
});
app.post('/request_form',async (req,res)=>{

    let data={};
    data['FirstName'] = ToCapitalize(req.body['FirstName']);
    data['LastName'] = ToCapitalize(req.body['LastName']);
    data['IsInGym'] = req.body['Ingym'];
    data['Email'] = req.body['Email'];
    data['Phone'] = req.body['Phone'];
    data['Description'] = req.body['Description'];
    data['PaymentMode'] = req.body['PaymentMode']
    data['TimeStamp'] = dateTime();
    if(data['IsInGym'] == "Yes"){
      data['Date'] = '';
      data['Time'] = '';
    }
    else{
      data['Date'] = req.body['date'];
      data['Time'] = req.body['time'];
    }
    console.log(data);
    let isCovid =false;
    let arr = [req.body['q1_yes'],req.body['q2_yes'],req.body['q3_yes']];
    for(var i=0;i<arr.length;i++){
      if(arr[i] === 'Yes' ){
        isCovid = true;
        break;
      }
    }
    try{
      let RequestFormModel = new RequestForm(data);
      await RequestFormModel.save();  
    }
    catch(err){
      console.log(err);
    }
    
    if(data['IsInGym'] === "Yes"){

        let data1 = {};
        data1.Name = data["FirstName"];
        const questions = ['Have you experienced any of the following symptoms in the past 48 hours: Fever or Chills, Cough, Shortness of breathing or difficulty breathing, fatigue, muscle or body aches, headache, loss of taste or smell, sore throat, congestion or runny nose, nausea or vomiting, diarrhe','Have you had close contact with a laboratory confirmed case of COVID-19 in the last 14 days?','Was your daily temperature self-screening greater than 100.4 degrees fahrenheit?'];
        data1.Questions = questions;
        data1.Answers = arr;
        data1.TimeStamp = data.TimeStamp;
        let SelfAssessModel = new SelfAssess(data1);
        await SelfAssessModel.save();
        
    }
    CreateTextMessage(data,isCovid);
    res.redirect('request_form');
});

app.get('/payment',(req,res)=>{
  PaymentForm.find({}).then(data => {
    console.log(data);
  })
    res.render('payment');
});
const client = new Client({
    environment: Environment.Production,
    accessToken: accessToken,
  });
  
  app.post('/process-payment', async (req, res) => {
    const requestParams = req.body;
    let data = {};
    const name = ToCapitalize(requestParams.name);
    const amount = requestParams.amount;
    const note = requestParams.note;
    data['Name']=name;
    data['Amount']=amount;
    data['TimeStamp']=dateTime();
    data['Note']=note;
    console.log(name,amount);
    // Charge the customer's card
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
      const response = await paymentsApi.createPayment(requestBody);
      res.status(200).json({
        'title': 'Payment Successful',
        'result': response.result
      });
      let PaymentFormModel = new PaymentForm(data);
      await PaymentFormModel.save();
      CreateTextMessage1(data);
    } catch(error) {
      let errorResult = null;
      if (error instanceof ApiError) {
          console.log('here');
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
});