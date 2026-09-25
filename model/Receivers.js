const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const OrphanageSchema= new mongoose.Schema({
   name:{
        type:String,
        required:true,
        unique:true
    },
    manager:{
        type:String,
        required:true
    },
    email:{
        required:true,
        unique:true,
        type:String
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        match: [
        /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
        "Password must be at least 8 characters long and contain at least one letter and one number."
        ]
    }
    ,
    role:{
        type:String,
        enum:['vendors','orphanage']
    },
    phone:{
        type:String
    },
    address:{
        type:String
    },
    location:{
        type:{
            type:String,
            enum:['Point'],
            default:'Point'
        },
        coordinates:{
            type:[Number],
            default:[76.7794, 30.7333]
        }
    },
    verificationStatus:{
        type:String,
        enum:['pending','verified','rejected'],
        default:'pending'
    },
    accountStatus:{
        type:String,
        enum:['active','inactive','blocked'],
        default:'active'
    }
}
,{timestamps:true});


// password hashing logic
OrphanageSchema.pre('save',async function(){
    try{
        if(!this.isModified('password'))    return;
        const salt= await bcrypt.genSalt(10);
        const hashedPwd= await bcrypt.hash(this.password,salt);
        this.password=hashedPwd;
    }catch(err){
        throw err;
    }
});

//password checking logic

OrphanageSchema.methods.comparePassword= async function(userPwd){
    try{
        const isMatch=await bcrypt.compare(userPwd,this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}

const Orphanage= mongoose.model('Orphanage',OrphanageSchema);
module.exports=Orphanage;