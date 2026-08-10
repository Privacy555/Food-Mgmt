const mongoose=require('mongoose');
const  bcrypt=require('bcrypt');

const vendorsSchema= new mongoose.Schema({
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
        type:string
    },
    password:{
        type: String,
        required: true,
        minlength: 8,
        match: [
        /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
        "Password must be at least 8 characters long and contain at least one letter and one number."
        ]
    
    },
    role:{
        type:String,
        enum:['vendors','orphanage'];
    }
},{timestamps:true});


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
mongoose.exports=vendors;