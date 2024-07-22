const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,

    },
    lastname: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    profilePhoto: {
        type: String
    },
    cart: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
        default: []
    }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    address: {
        country: { type: String },
        county: { type: String },
        town: { type: String },
        building: { type: String }
    }
}, { timestamps: true });

//Export the model
module.exports = mongoose.model('Users', userSchema);