const mongoose= require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.LOCALDB);

const Admin=require('./../model/admin');

(async()=>{
    const search= await Admin.findOne({email:'admin@gmail.com'});
    if(search){
        console.log("Admin with that gmail already exists.");
        process.exit();
    }
    await Admin.create({
        name:"Admin",
        email:"admin@gmail.com",
        password:"12345",
        phone:"9041249847",
        role:"admin",
        accountStatus:"active",
        
    })
    console.log("Admin created successfully.");

    process.exit();
})();