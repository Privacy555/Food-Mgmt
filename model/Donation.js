const mongoose = require("mongoose");

// FIX: Bug #3 - Update pickupLocation to proper GeoJSON format for 2dsphere indexing
const donationSchema = new mongoose.Schema(
    {
        // Restaurant that is donating the food
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "vendors",
            required: true
        },

        // Name of the food
        foodName: {
            type: String,
            required: true,
            trim: true
        },

        // Type/category of food
        foodType: {
            type: String,
            enum: ["veg", "non-veg"],
            required: true
        },

        // How much food is available
        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        // Unit of quantity
        quantityUnit: {
            type: String,
            enum: ["meals", "kg", "litres", "packets"],
            required: true
        },

        // When the food was prepared
        preparedAt: {
            type: Date,
            required: true
        },

        // Food should not be distributed after this time
        expiryTime: {
            type: Date,
            required: true
        },

        // Pickup location in GeoJSON format
        pickupLocation: {
            address: {
                type: String,
                required: true
            },
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            // GeoJSON coordinates [longitude, latitude]
            coordinates: {
                type: [Number],
                required: true
            }
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Orphanage",
            default: null
        },

        // Tracking timestamps for real-time notifications
        claimedAt: {
            type: Date,
            default: null
        },
        pickedUpAt: {
            type: Date,
            default: null
        },
        completedAt: {
            type: Date,
            default: null
        },

        // Current state of the donation
        status: {
            type: String,
            enum: [
                "available",
                "claimed",
                "picked_up",
                "completed",
                "expired",
                "cancelled"
            ],
            default: "available"
        },

        // Optional information from restaurant
        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);


// GeoSpatial index on GeoJSON pickupLocation
// FIX: Bug #3 - Index the GeoJSON field properly
donationSchema.index({
    "pickupLocation": "2dsphere"
});


module.exports = mongoose.model("Donation", donationSchema);




// {
//   "restaurant": "6891a7f2c45e8b0012345678",

//   "foodName": "Vegetable Biryani",

//   "foodType": "veg",

//   "quantity": 30,

//   "quantityUnit": "meals",

//   "preparedAt": "2026-08-10T11:00:00.000Z",

//   "expiryTime": "2026-08-10T18:00:00.000Z",

//   "pickupLocation": {
//     "address": "Sector 17, Chandigarh",
//     "type": "Point",
//     "coordinates": [76.7794, 30.7333]
//   },

//   "status": "available",

//   "notes": "Food is freshly prepared and packed."
// }