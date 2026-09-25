const express=require('express');
const cors=require('cors');
const app=express();
app.use(cors());
app.use(express.json());

//importing db for connection with server
const db=require('./db');

require('dotenv').config();



//routes here
const adminRoute=require('./routes/adminRoute');
app.use('/admin',adminRoute);

const vendorsRoute=require('./routes/vendorsRoute');
app.use('/vendors',vendorsRoute);

const receiversRoute=require('./routes/ReceiversRoute');
app.use('/receivers',receiversRoute);

// const adminRoute= require('./routes/adminRoute');
// app.use('admin',adminRoute)                             //"Whenever a request starts with /admin, send it to the adminRoute router."

app.get('/',(req,res)=>{
    res.json({
        message:"Welcome to food management system.",
        routes:{
            signup:"/vendors/signup",
            login:"vendors/login",
            profile:"vendors/profile"

        }
    });
})

const PORT=process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server is running on port:${PORT}`);
});