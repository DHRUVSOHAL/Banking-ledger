const mongoose = require('mongoose')

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "ledger must be associated with an account"],
        index: true,//b+tree index for faster retrieval of ledgers by account,
        immutable: true//ledger's account cannot be changed once set

    },
    amount: {
        type: Number,
        required: [true, "amount is required for creating a ledger entry"],
        immutable: true//ledger's amount cannot be changed once set
    },
    transection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transection",
        required: [true, "ledger must be associated with a transection"],
        index: true,//b+tree index for faster retrieval of ledgers by transection
        immutable: true//ledger's transection cannot be changed once set
    },
    type: {
        type: String,
        enum: {
            values: ["DEBIT", "CREDIT"],
            message: "type can be either DEBIT or CREDIT"
        },
        required: [true, "type is required for creating a ledger entry"],
        immutable: true//ledger's type cannot be changed once set
    }
})



function preventLedgerModification(){
    throw new Error("Ledger entries cannot be modified once created")
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification)
ledgerSchema.pre('updateOne', preventLedgerModification)
ledgerSchema.pre('updateMany', preventLedgerModification)
ledgerSchema.pre('remove', preventLedgerModification)
ledgerSchema.pre('deleteOne', preventLedgerModification)
ledgerSchema.pre('deleteMany', preventLedgerModification)
ledgerSchema.pre('findOneAndDelete', preventLedgerModification)
ledgerSchema.pre('findOneAndRemove', preventLedgerModification)




const ledgerModel=mongoose.model("ledger",ledgerSchema)

module.exports=ledgerModel