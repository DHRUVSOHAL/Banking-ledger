const mongoose = require('mongoose');


const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true//b+tree index for faster retrieval of accounts by user

    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status can be either ACTIVE, FROZEN or CLOSED",
            default: "ACTIVE"
        }
    },
    currency: {
        type: String,
        required: [true, "currency is required for creating an account"],
        default: "INR"
    },

}, {
    timestampes: true
})

accountSchema.index({ user: 1, status: 1 })//compound index for faster retrieval of accounts by user and status

const accountModel = mongoose.model("account", accountSchema)

module.exports = accountModel