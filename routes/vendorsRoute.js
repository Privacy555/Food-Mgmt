const express = require("express");
const router = express.Router();

const Vendors = require("../model/vendors");
const Donation = require("../model/Donation");

const { generateToken, jwtAuthMiddleware } = require("../middleware/jwt");
const allowedRole = require("../middleware/roleMiddleware");

require("dotenv").config();


// ======================================================
// VENDOR REGISTRATION
// ======================================================

router.post("/register", async (req, res) => {
    try {

        const {
            name,
            ownerName,
            email,
            password,
            phone,
            address,
            location,
            restaurantType
        } = req.body;


        // Check whether vendor already exists
        const existingVendor = await Vendors.findOne({ email });

        if (existingVendor) {
            return res.status(409).json({
                message: "Vendor with this email already exists."
            });
        }


        // Create new vendor
        const vendor = new Vendors({
            name,
            ownerName,
            email,
            password,
            phone,
            address,
            location,
            restaurantType
        });


        await vendor.save();


        res.status(201).json({
            message: "Vendor registered successfully.",
            vendor: {
                id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                verificationStatus: vendor.verificationStatus
            }
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});


// ======================================================
// VENDOR LOGIN
// ======================================================

router.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;


        const vendor = await Vendors
            .findOne({ email })
            .select("+password");


        if (!vendor) {
            return res.status(401).json({
                message: "Invalid credentials."
            });
        }


        // Check account status
        if (vendor.accountStatus !== "active") {
            return res.status(403).json({
                message: "Your account is not active."
            });
        }


        // Check password
        const isMatch = await vendor.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials."
            });
        }


        // Check whether vendor has been verified
        if (vendor.verificationStatus !== "verified") {
            return res.status(403).json({
                message: "Your account has not been verified by admin yet."
            });
        }


        const payload = {
            id: vendor._id,
            email: vendor.email,
            role: "Vendor"
        };


        const token = generateToken(payload);


        vendor.lastLogin = new Date();

        await vendor.save();


        res.status(200).json({
            message: "Login successful.",
            Token: token
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});


// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

router.use(jwtAuthMiddleware);


// ======================================================
// ROLE MIDDLEWARE
// ======================================================

// IMPORTANT:
// This must match the role stored inside your JWT.
//
// If your middleware uses "Vendor", keep this.
// If your JWT uses "vendor", change it accordingly.

router.use(allowedRole("Vendor"));


// ======================================================
// GET VENDOR PROFILE
// ======================================================

router.get("/profile", async (req, res) => {
    try {

        const vendor = await Vendors.findById(req.user.id);

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found."
            });
        }


        res.status(200).json({
            vendor
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});


// ======================================================
// UPDATE VENDOR PROFILE
// ======================================================

router.put("/profile", async (req, res) => {
    try {

        const {
            name,
            ownerName,
            phone,
            address,
            location,
            restaurantType
        } = req.body;


        const vendor = await Vendors.findById(req.user.id);

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found."
            });
        }


        if (name !== undefined)
            vendor.name = name;

        if (ownerName !== undefined)
            vendor.ownerName = ownerName;

        if (phone !== undefined)
            vendor.phone = phone;

        if (address !== undefined)
            vendor.address = address;

        if (location !== undefined)
            vendor.location = location;

        if (restaurantType !== undefined)
            vendor.restaurantType = restaurantType;


        await vendor.save();


        res.status(200).json({
            message: "Profile updated successfully.",
            vendor
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});


// ======================================================
// CREATE DONATION
// ======================================================

router.post("/donations", async (req, res) => {
    try {

        const {
            foodName,
            foodType,
            quantity,
            quantityUnit,
            preparedAt,
            expiryTime,
            pickupLocation,
            notes
        } = req.body;


        // Check vendor
        const vendor = await Vendors.findById(req.user.id);

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found."
            });
        }


        // Only verified vendors can donate
        if (vendor.verificationStatus !== "verified") {
            return res.status(403).json({
                message: "Vendor must be verified before creating donations."
            });
        }


        // Create donation
        const donation = new Donation({
            restaurant: vendor._id,

            foodName,
            foodType,
            quantity,
            quantityUnit,
            preparedAt,
            expiryTime,
            pickupLocation,
            notes
        });


        await donation.save();


        res.status(201).json({
            message: "Food donation created successfully.",
            donation
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});


// ======================================================
// GET ALL DONATIONS CREATED BY VENDOR
// ======================================================

router.get("/donations", async (req, res) => {
    try {

        const donations = await Donation
            .find({
                restaurant: req.user.id
            })
            .populate("receiver", "name email phone")
            .sort({ createdAt: -1 });


        if (donations.length === 0) {
            return res.status(404).json({
                message: "No donations found."
            });
        }


        res.status(200).json({
            count: donations.length,
            donations
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});


// ======================================================
// GET ONE DONATION
// ======================================================

router.get("/donations/:id", async (req, res) => {
    try {

        const donation = await Donation
            .findOne({
                _id: req.params.id,
                restaurant: req.user.id
            })
            .populate("receiver", "name email phone");


        if (!donation) {
            return res.status(404).json({
                message: "Donation not found."
            });
        }


        res.status(200).json({
            donation
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});


// ======================================================
// UPDATE DONATION
// ======================================================

router.put("/donations/:id", async (req, res) => {
    try {

        const donation = await Donation.findOne({
            _id: req.params.id,
            restaurant: req.user.id
        });


        if (!donation) {
            return res.status(404).json({
                message: "Donation not found."
            });
        }


        // Don't allow editing after someone has claimed it
        if (donation.status !== "available") {
            return res.status(400).json({
                message: "Only available donations can be updated."
            });
        }


        const {
            foodName,
            foodType,
            quantity,
            quantityUnit,
            preparedAt,
            expiryTime,
            pickupLocation,
            notes
        } = req.body;


        if (foodName !== undefined)
            donation.foodName = foodName;

        if (foodType !== undefined)
            donation.foodType = foodType;

        if (quantity !== undefined)
            donation.quantity = quantity;

        if (quantityUnit !== undefined)
            donation.quantityUnit = quantityUnit;

        if (preparedAt !== undefined)
            donation.preparedAt = preparedAt;

        if (expiryTime !== undefined)
            donation.expiryTime = expiryTime;

        if (pickupLocation !== undefined)
            donation.pickupLocation = pickupLocation;

        if (notes !== undefined)
            donation.notes = notes;


        await donation.save();


        res.status(200).json({
            message: "Donation updated successfully.",
            donation
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});


// ======================================================
// CANCEL DONATION
// ======================================================

router.put("/donations/:id/cancel", async (req, res) => {
    try {

        const donation = await Donation.findOne({
            _id: req.params.id,
            restaurant: req.user.id
        });


        if (!donation) {
            return res.status(404).json({
                message: "Donation not found."
            });
        }


        if (donation.status !== "available") {
            return res.status(400).json({
                message: "Only available donations can be cancelled."
            });
        }


        donation.status = "cancelled";

        await donation.save();


        res.status(200).json({
            message: "Donation cancelled successfully.",
            donation
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});


// ======================================================
// VIEW CLAIMED DONATIONS
// ======================================================

router.get("/donations/claimed", async (req, res) => {
    try {

        const donations = await Donation
            .find({
                restaurant: req.user.id,
                status: {
                    $in: [
                        "claimed",
                        "picked_up",
                        "completed"
                    ]
                }
            })
            .populate("receiver", "name email phone address")
            .sort({ createdAt: -1 });


        res.status(200).json({
            count: donations.length,
            donations
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});


// ======================================================
// MARK DONATION AS PICKED UP
// ======================================================

router.put("/donations/:id/picked-up", async (req, res) => {
    try {

        const donation = await Donation.findOne({
            _id: req.params.id,
            restaurant: req.user.id
        });


        if (!donation) {
            return res.status(404).json({
                message: "Donation not found."
            });
        }


        if (donation.status !== "claimed") {
            return res.status(400).json({
                message: "Donation must be claimed before pickup."
            });
        }


        donation.status = "picked_up";

        await donation.save();


        res.status(200).json({
            message: "Donation marked as picked up.",
            donation
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});


// ======================================================
// MARK DONATION AS COMPLETED
// ======================================================

router.put("/donations/:id/completed", async (req, res) => {
    try {

        const donation = await Donation.findOne({
            _id: req.params.id,
            restaurant: req.user.id
        });


        if (!donation) {
            return res.status(404).json({
                message: "Donation not found."
            });
        }


        if (donation.status !== "picked_up") {
            return res.status(400).json({
                message: "Donation must be picked up first."
            });
        }


        donation.status = "completed";

        await donation.save();


        res.status(200).json({
            message: "Donation completed successfully.",
            donation
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});


module.exports = router;






// Vendor registration
// Vendor login
// Vendor profile
// Create donation
// View own donations
// View a particular donation
// Update donation
// Cancel donation
// See claimed donations
// Mark food as picked up/completed