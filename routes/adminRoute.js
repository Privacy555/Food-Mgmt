const { application } = require('express');
const Admin=require('./../model/admin');
const Orphanage=require('./../model/orphanage');
const Vendors=require('./../model/vendors')

const express=require('express');
const router=express.Router();


const allowedRole=require('./../middleware/roleMiddleware');
const { generateToken } = require('../middleware/jwt');


router.get('/login',async (req,res)=>{
    try{

    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal server error."});
    }
})

router.post('/admin/login',(req,res)=>{
    try{
        const {email,password}=req.body ;                                                       //the name should be same in model too.
        const user=await Admin.findOne({email}).select('+password');
        
        if(!user){
            return res.status(401).json({Error:"Invalid Credentials."});
        }

        const isMatch= await user.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({error:"Invalid credentials."});
        }

        const payload={
            role:user.role,
            email:user.email
        }
        
        const token=generateToken(payload);
        res.status(200).json({Token: token});
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal server error. "});
    }
});