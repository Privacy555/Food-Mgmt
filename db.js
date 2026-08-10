const mongoose=require('mongoose');
const mongooseURL='mongodb://localhost:27017/FoodDonationPlatform';

mongoose.connect(mongooseURL);

const db=mongoose.connection;

db.on('connected',()=>{
    console.log("Server is connected successfully.");
});

db.on('disconnected',()=>{
    console.log("Server disconnected to server.");
});

db.on('error',(err)=>{
    console.log(`Error: ${err}`)
})

module.exports=db;