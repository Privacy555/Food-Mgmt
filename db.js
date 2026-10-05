const mongoose=require('mongoose');

const mongooseURL=process.env.LOCALDB;

mongoose.connect(mongooseURL);

const db=mongoose.connection;

db.on('connected',()=>{
    console.log("Server is connected successfully to the database.");
});

db.on('disconnected',()=>{
    console.log("Server disconnected to server.");
});

db.on('error',(err)=>{
    console.log(`Error: ${err}`)
})

module.exports=db;