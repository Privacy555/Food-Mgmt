const mongoose = require("mongoose");
const bcrypt=require('bcrypt');

const adminSchema = new mongoose.Schema(
    {
        // Admin's name
        name: {
            type: String,
            required: true,
            trim: true
        },

        // Admin's email for login
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        // Hashed password
        password: {
            type: String,
            required: true,
            select: false
        },

        // Contact number
        phone: {
            type: String,
            required: true
        },

        // Admin's permission level
        role: {
            type: String,
            enum: ["admin", "super_admin"],
            default: "admin"
        },

        // Whether the admin account is usable
        accountStatus: {
            type: String,
            enum: ["active", "inactive", "blocked"],
            default: "active"
        },

        // Last time admin logged in
        lastLogin: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// password hashing logic
adminSchema.pre('save',async function(){
    try{
        if(!this.isModified('password'))    return;
        const salt=await  bcrypt.genSalt(10);
        const hashedPwd= await bcrypt.hash(this.password,salt);
        this.password=hashedPwd;
    }catch(err){
        throw err;
    }
});

//password checking logic

adminSchema.methods.comparePassword= async function(userPwd){
    try{
        const isMatch=await bcrypt.compare(userPwd,this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}

module.exports = mongoose.model("Admin", adminSchema);



// {
//   "_id": "68a123456789abcdef123456",

//   "name": "FoodShare Administrator",

//   "email": "admin@foodshare.com",

//   "password": "$2b$10$hashedPasswordHere",

//   "phone": "9876543210",

//   "role": "admin",

//   "accountStatus": "active",

//   "lastLogin": "2026-08-15T07:30:00.000Z"
// }