const mongoose = require('mongoose');

const ledgerModel = require('./ledger.model.js')

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
            message: "Status can be either ACTIVE, FROZEN or CLOSED"
        },
        default: "ACTIVE"

    },
    currency: {
        type: String,
        required: [true, "currency is required for creating an account"],
        default: "INR"
    },

}, {
    timestamps: true
})

accountSchema.index({ user: 1, status: 1 })//compound index for faster retrieval of accounts by user and status
accountSchema.methods.getBalance = async function () {
    const balanceData = await ledgerModel.aggregate([
        {
            $match: {
                account: this._id
            }
        },
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "DEBIT"] },
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "CREDIT"] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: {
                    $subtract: ["$totalCredit", "$totalDebit"]
                }
            }
        }
    ]);
    if(balanceData.length==0){
        return 0
    }

    return balanceData[0].balance
};

const accountModel = mongoose.model("account", accountSchema)

module.exports = accountModel