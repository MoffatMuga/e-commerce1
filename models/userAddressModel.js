const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    country: { type: String, required: true },
    county: { type: String, required: true },
    town: { type: String, required: true },
    building: { type: String, required: true },

})

module.exports = mongoose.model('Address', addressSchema)