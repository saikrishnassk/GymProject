const express = require('express');
const config = require('./config');
require('dotenv').config();
const app = express();


app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");
app.set("views",__dirname+"/views");

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/feedback",(req,res)=>{
    res.render("feedback");
});

app.post("/feedback",(req,res)=>{
    console.log(req.body);
    res.render("index");
})

const PORT = config.port; // OR const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Connected on ${PORT}`);
})