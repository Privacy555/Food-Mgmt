const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const vendorsSchema = new mongoose.Schema(
    {
        // Restaurant's name
        name: {
            type: String,
            required: true,
            trim: true
        },

        // Owner / manager name
        ownerName: {
            type: String,
            required: true,
            trim: true
        },

        // Login email
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

        // Restaurant address
        address: {
            street: {
                type: String,
                required: true
            },

            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },

            pincode: {
                type: String,
                required: true
            }
        },

        // Used to find nearby donations
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },

            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        },

        // Type of food business
        restaurantType: {
            type: String,
            enum: [
                "restaurant",
                "hotel",
                "cafe",
                "bakery",
                "catering"
            ],
            required: true
        },

        // Admin verification
        verificationStatus: {
            type: String,
            enum: [
                "pending",
                "verified",
                "rejected"
            ],
            default: "pending"
        },

        // Account status
        accountStatus: {
            type: String,
            enum: [
                "active",
                "inactive",
                "blocked"
            ],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);


// Geospatial index
vendorsSchema.index({
    location: "2dsphere"
});





//password hashing logic
vendorsSchema.pre('save',async function(){
    try{
        if(! this.isModified('password'))   return;
        const salt=await bcrypt.genSalt(10);
        const hashedPwd= await bcrypt.hash(this.password,salt);
        this.password=hashedPwd;
    }catch(err){
        throw err;
    }
});


//password comparision logic

vendorsSchema.methods.comparePassword= async function(userPwd){
    try{
        const isMatch= await bcrypt.compare(userPwd,this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}

const vendors= mongoose.model('vendors',vendorsSchema);
module.exports=vendors;








// {
//   "_id": "6891a7f2c45e8b0012345678",

//   "name": "Taste of India",

//   "email": "tasteofindia@gmail.com",

//   "phone": "9876543210",

//   "password": "$2b$10$hashedPasswordHere",

//   "role": "restaurant",

//   "address": {
//     "street": "Sector 17",
//     "city": "Chandigarh",
//     "state": "Punjab",
//     "pincode": "160017"
//   },

//   "location": {
//     "type": "Point",
//     "coordinates": [76.7794, 30.7333]
//   },

//   "restaurantType": "restaurant",

//   "verificationStatus": "verified",

//   "accountStatus": "active"
// }