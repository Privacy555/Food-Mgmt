const express = require("express");
const router = express.Router();

const Receivers = require("../model/Receivers");
const Donation = require("../model/Donation");

const { generateToken, jwtAuthMiddleware } = require("../middleware/jwt");
const allowedRole = require("../middleware/roleMiddleware");

require("dotenv").config();



// 1. RECEIVER REGISTRATION


router.post("/register", async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            phone,
            address,
            location
        } = req.body;

        // Check whether receiver already exists
        const existingReceiver = await Receivers.findOne({ email });

        if (existingReceiver) {
            return res.status(409).json({
                message: "Receiver already registered."
            });
        }

        const receiver = new Receivers({
            name,
            email,
            password,
            phone,
            address,
            location,

            // Admin has to verify the receiver
            verificationStatus: "pending",

            accountStatus: "active"
        });

        await receiver.save();

        res.status(201).json({
            message: "Receiver registered successfully. Waiting for admin verification."
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});




// 2. RECEIVER LOGIN


router.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;

        const receiver = await Receivers
            .findOne({ email })
            .select("+password");

        if (!receiver) {
            return res.status(401).json({
                error: "Invalid credentials."
            });
        }

        // Check account status
        if (receiver.accountStatus !== "active") {
            return res.status(403).json({
                message: "Your account is not active."
            });
        }

        // Receiver must be verified by admin
        if (receiver.verificationStatus !== "verified") {
            return res.status(403).json({
                message: "Your account has not been verified by admin."
            });
        }

        const isMatch = await receiver.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid credentials."
            });
        }

        // Update last login
        receiver.lastLogin = new Date();

        await receiver.save();

        const payload = {
            id: receiver._id,
            role: "Receiver",
            email: receiver.email
        };

        const token = generateToken(payload);

        res.status(200).json({
            message: "Login successful.",
            token
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});




// AUTHENTICATION FOR ROUTES BELOW THIS POINT


router.use(jwtAuthMiddleware);
router.use(allowedRole("Receiver"));




// 3. GET RECEIVER PROFILE


router.get("/profile", async (req, res) => {
    try {

        const receiver = await Receivers.findById(req.user.id)
            .select("-password");

        if (!receiver) {
            return res.status(404).json({
                message: "Receiver not found."
            });
        }

        res.status(200).json({
            receiver
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});




// 4. UPDATE RECEIVER PROFILE


router.put("/profile", async (req, res) => {
    try {

        const {
            name,
            phone,
            address,
            location
        } = req.body;

        const receiver = await Receivers.findByIdAndUpdate(
            req.user.id,
            {
                name,
                phone,
                address,
                location
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!receiver) {
            return res.status(404).json({
                message: "Receiver not found."
            });
        }

        res.status(200).json({
            message: "Profile updated successfully.",
            receiver
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});




// 5. VIEW AVAILABLE DONATIONS


router.get("/donations", async (req, res) => {
    try {

        const donations = await Donation.find({
            status: "available",
            expiryTime: { $gt: new Date() }
        }).populate(
            "restaurant",
            "name phone address location"
        );

        res.status(200).json({
            count: donations.length,
            donations
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});



// 6. VIEW ONE DONATION


router.get("/donations/:id", async (req, res) => {
    try {

        const donation = await Donation.findOne({
            _id: req.params.id,
            status: "available",
            expiryTime: { $gt: new Date() }
        }).populate(
            "restaurant",
            "name phone address location"
        );

        if (!donation) {
            return res.status(404).json({
                message: "Donation not found or no longer available."
            });
        }

        res.status(200).json({
            donation
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});




// 7. CLAIM DONATION

router.post("/donations/:id/claim", async (req, res) => {
    try {

        const donation = await Donation.findOne({
            _id: req.params.id,
            status: "available",
            expiryTime: { $gt: new Date() }
        });

        if (!donation) {
            return res.status(404).json({
                message: "Donation is no longer available."
            });
        }

        // For now, mark the entire donation as claimed
        donation.status = "claimed";

        // Store receiver who claimed it
        donation.receiver = req.user.id;

        await donation.save();

        res.status(200).json({
            message: "Donation claimed successfully.",
            donation
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});



// 8. VIEW MY CLAIMED DONATIONS

router.get("/my-donations", async (req, res) => {
    try {

        const donations = await Donation.find({
            receiver: req.user.id
        }).populate(
            "restaurant",
            "name phone address"
        );

        res.status(200).json({
            count: donations.length,
            donations
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});



// 9. UPDATE PICKUP STATUS


router.put("/donations/:id/pickup-status", async (req, res) => {
    try {

        const { status } = req.body;

        const allowedStatuses = [
            "picked_up",
            "completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid pickup status."
            });
        }

        const donation = await Donation.findOne({
            _id: req.params.id,
            receiver: req.user.id
        });

        if (!donation) {
            return res.status(404).json({
                message: "Donation not found."
            });
        }

        donation.status = status;

        await donation.save();

        res.status(200).json({
            message: "Pickup status updated.",
            donation
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});


// ======================================================
// 10. CANCEL CLAIM
// ======================================================

router.put("/donations/:id/cancel", async (req, res) => {
    try {

        const donation = await Donation.findOne({
            _id: req.params.id,
            receiver: req.user.id,
            status: "claimed"
        });

        if (!donation) {
            return res.status(404).json({
                message: "Claim not found."
            });
        }

        // Make donation available again
        donation.status = "available";
        donation.receiver = null;

        await donation.save();

        res.status(200).json({
            message: "Donation claim cancelled.",
            donation
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Internal server error."
        });
    }
});


module.exports = router;



// Receiver
// ├── Register
// ├── Login
// ├── View profile
// ├── Update profile
// ├── View nearby donations
// ├── View a particular donation
// ├── Claim donation
// ├── View my claims
// ├── Update pickup status
// └── Cancel claim
