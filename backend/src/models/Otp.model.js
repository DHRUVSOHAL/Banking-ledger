const mongoose = require('mongoose')

const OtpSchema = new mongoose.Schema({
    otp: {
        type: String, // FIX: Number se String kiya kyunki bcrypt hash string hota hai
        required: true // FIX: require se required kiya
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // 10 minutes mein auto-delete
    }
})

// Tip: Model ka naam Capital se start karna ('Otp') ek acchi practice hai
const otpModel = mongoose.model('Otp', OtpSchema)
module.exports = otpModel