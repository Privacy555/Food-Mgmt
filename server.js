const express=require('express');
const app=express();

const bodyParser=require('body-parser');
app.use(bodyParser.json());

//importing db for connection with server
const db=require('./db');

//require('dotenv').config();



//routes here

// const adminRoute= require('./routes/adminRoute');
// app.use('admin',adminRoute)                             //"Whenever a request starts with /admin, send it to the adminRoute router."

app.get('/',()=>{
    res.json({
        message:"Welcome to food management system.",
        routes:{
            signup:"/vendors/signup",
            login:"vendors/login",
            profile:"vendors/profile"

        }
    });
})

const PORT=3000 //process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server is running on port:${PORT}`);
});