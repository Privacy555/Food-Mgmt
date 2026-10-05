const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');

const Receivers = require("../model/Receivers");
const Donation = require("../model/Donation");

const { generateToken, jwtAuthMiddleware } = require("../middleware/jwt");
const allowedRole = require("../middleware/roleMiddleware");





// 1. RECEIVER REGISTRATION


router.post("/register", [
    body('name').trim().notEmpty().withMessage('Organization name is required'),
    body('manager').trim().notEmpty().withMessage('Manager name is required'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Min 8 chars')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),
    body('phone').trim().notEmpty().withMessage('Phone is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
        const {
            name,
            manager,
            email,
            password,
            phone,
            address,
            location,
            role
        } = req.body;

        // Check whether receiver already exists with same email or name
        const existingReceiver = await Receivers.findOne({
            $or: [{ email }, { name }]
        });

        if (existingReceiver) {
            if (existingReceiver.email === email) {
                return res.status(409).json({
                    error: "Receiver with this email already registered."
                });
            }
            return res.status(409).json({
                error: "Organization with this name already registered."
            });
        }

        const receiver = new Receivers({
            name,
            manager,
            email,
            password,
            phone,
            address,
            location: location || { type: 'Point', coordinates: [76.7794, 30.7333] },
            role: role || "orphanage",
            // Admin has to verify the receiver
            verificationStatus: "pending",
            accountStatus: "active"
        });

        await receiver.save();

        res.status(201).json({
            message: "Receiver registered successfully. Waiting for admin verification.",
            receiver: {
                id: receiver._id,
                name: receiver.name,
                manager: receiver.manager,
                email: receiver.email,
                verificationStatus: receiver.verificationStatus
            }
        });

    } catch (err) {
        console.error("Receiver registration error:", err);

        if (err.name === 'ValidationError') {
            const firstMsg = Object.values(err.errors)[0]?.message || 'Validation error';
            return res.status(400).json({ error: firstMsg });
        }

        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || 'Email or Name';
            return res.status(409).json({ error: `${field} is already registered.` });
        }

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
            return res.status(403).json({error: "Your account is not active."
            });
        }

        // Receiver must be verified by admin
        if (receiver.verificationStatus !== "verified") {
            return res.status(403).json({error: "Your account has not been verified by admin."
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
            return res.status(404).json({error: "Receiver not found."
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
            return res.status(404).json({error: "Receiver not found."
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
            "name phone address location email"
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
            "name phone address location email"
        );

        if (!donation) {
            return res.status(404).json({error: "Donation not found or no longer available."
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




// 7. CLAIM DONATION (Atomic operation: guarantees no duplicate claims)

router.post("/donations/:id/claim", async (req, res) => {
    try {

        // Atomic check & update: only claims if status is strictly 'available'
        const donation = await Donation.findOneAndUpdate(
            {
                _id: req.params.id,
                status: "available",
                expiryTime: { $gt: new Date() }
            },
            {
                $set: {
                    status: "claimed",
                    receiver: req.user.id,
                    claimedAt: new Date()
                }
            },
            { new: true }
        ).populate("restaurant", "name phone address location email");

        if (!donation) {
            return res.status(400).json({
                error: "This food has already been claimed by another organization or is no longer available."
            });
        }

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
            "name phone address location email"
        ).sort({ claimedAt: -1, createdAt: -1 });

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
            return res.status(400).json({error: "Invalid pickup status."
            });
        }

        const updateData = { status };
        if (status === "picked_up") updateData.pickedUpAt = new Date();
        if (status === "completed") updateData.completedAt = new Date();

        const donation = await Donation.findOneAndUpdate(
            {
                _id: req.params.id,
                receiver: req.user.id
            },
            { $set: updateData },
            { new: true }
        ).populate("restaurant", "name phone address location email");

        if (!donation) {
            return res.status(404).json({error: "Donation not found."
            });
        }

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

        const donation = await Donation.findOneAndUpdate(
            {
                _id: req.params.id,
                receiver: req.user.id,
                status: "claimed"
            },
            {
                $set: {
                    status: "available",
                    receiver: null,
                    claimedAt: null
                }
            },
            { new: true }
        );

        if (!donation) {
            return res.status(404).json({error: "Claim not found."
            });
        }

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
