
const Admin=require('./../model/admin');
const Receivers=require('../model/Receivers');
const Vendors=require('./../model/vendors');
const Donation=require('../model/Donation');

const {jwtAuthMiddleware,generateToken}=require('./../middleware/jwt')

const express=require('express');
const router=express.Router();


const allowedRole=require('./../middleware/roleMiddleware');






router.post('/login',async(req,res)=>{
    try{
        const {email,password}=req.body ;                                                       //the name should be same in model too.
        const user=await Admin.findOne({email}).select('+password');
        
        if(!user){
            return res.status(401).json({error:"Invalid Credentials."});
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
        user.lastLogin=new Date();                                                              // for updating login date
        await user.save();

        res.status(200).json({token: token});
        
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error. "});
    }
});


router.get('/',(req,res)=>{
  res.json({message:"Welcome to the admin section."});
});

router.use(jwtAuthMiddleware);
router.use(allowedRole('admin', 'super_admin'));


// to get all vendors 
router.get('/get-vendors',async(req,res)=>{
    try{
        const users= await Vendors.find();
        if(!users){
            return res.json({message:"No vendors found."})
        }
        res.status(200).json({users});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error."});
    }
});


//to get vendor with given name
router.get('/get-vendors/:name',async(req,res)=>{
    try{
        const name= req.params.name;
        const users= await Vendors.findOne({name:name});
        if(!users){
            return res.status(404).json({error:"No vendors found."})
        }
        res.status(200).json({users});
        console.log("Vendor with given name fetched.");
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error."});
    }
});


router.get('/get-receivers',async(req,res)=>{
    try{
        const users= await Receivers.find();                        //It'll return answer in the form of array. []
        if(users.length===0){
            return res.status(404).json({error:"No receivers found."})
        }
        res.status(200).json({users});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error."});
    } 
});


router.get('/get-receivers/:name',async(req,res)=>{
    try{
        const name= req.params.name;
        const users= await Receivers.findOne({name:name});
        if(!users){
            return res.status(404).json({error:"No Receivers found."})
        }
        res.status(200).json({users});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error."});
    } 
});



router.get('/dashboard', async (req, res) => {
    try {

        const totalVendors = await Vendors.countDocuments();

        const totalReceivers = await Receivers.countDocuments();

        const totalDonations = await Donation.countDocuments();

        const completedDonations = await Donation.countDocuments({
            status: "completed"
        });

        res.status(200).json({
            totalVendors,
            totalReceivers,
            totalDonations,
            completedDonations
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});



router.get('/donations', async (req, res) => {
    try {

        const donations = await Donation
            .find()
            .populate('restaurant');

        if (donations.length === 0) {
            return res.status(404).json({error: "No donations found."
            });
        }

        res.status(200).json({
            donations
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});



//Verify a vendor
router.put('/vendors/:id/verify', async (req, res) => {
    try {
        const id = req.params.id;

        const vendor = await Vendors.findByIdAndUpdate(
            id,
            {
                verificationStatus: "verified"
            },
            {
                new: true
            }
        );

        if (!vendor) {
            return res.status(404).json({error: "Vendor not found."
            });
        }

        res.status(200).json({
            message: "Vendor verified successfully.",
            vendor
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});


//Reject vendor
router.put('/vendors/:id/reject', async (req, res) => {
    try {

        const vendor = await Vendors.findByIdAndUpdate(
            req.params.id,
            {
                verificationStatus: "rejected"
            },
            {
                new: true
            }
        );

        if (!vendor) {
            return res.status(404).json({error: "Vendor not found."
            });
        }

        res.status(200).json({
            message: "Vendor rejected.",
            vendor
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});



// Verify Receiver

router.put('/receivers/:id/verify', async (req, res) => {
    try {

        const receiver = await Receivers.findByIdAndUpdate(
            req.params.id,
            {
                verificationStatus: "verified"
            },
            {
                new: true
            }
        );

        if (!receiver) {
            return res.status(404).json({error: "Receiver not found."
            });
        }

        res.status(200).json({
            message: "Receiver verified successfully.",
            receiver
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});



// get pending vendors
router.get('/vendors/pending', async (req, res) => {
    try {

        const vendors = await Vendors.find({
            verificationStatus: "pending"
        });

        res.status(200).json({
            vendors
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});


//get pending receivers
router.get('/receivers/pending', async (req, res) => {
    try {

        const receivers = await Receivers.find({
            verificationStatus: "pending"
        });

        res.status(200).json({
            receivers
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});

module.exports=router;