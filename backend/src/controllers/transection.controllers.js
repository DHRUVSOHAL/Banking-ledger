const transectionModel = require('../models/transection.model.js')


const ledgerModel = require('../models/ledger.model.js')

const emailService = require('../services/email.service.js')
const accountModel = require('../models/account.model.js')
const mongoose = require('mongoose')
/**
 * create a new transection
 * The 10 steps TRANSFER flow:
 * 1.validate request
 * 2.validate idempotencykey
 * 3.check account status
 * 4.Derive sender balance fro ledger
 * 5.create transection(pending)
 * 6.create debit ledger entry
 * 7.create credit ledger entry
 * 8.mark transection complete
 * 9.commit mongodb sessions
 * 10.send email notifcation
 */


async function createTransection(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: 'All fields are required' })
    }
}
async function createInitialFundsTransection(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !idempotencyKey || !amount || amount <= 0) {
        return res.status(400).json({
            message: "Valid toAccount, amount and idempotencyKey are required"
        });
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Check idempotency
        const existingTransection = await transectionModel.findOne({
            idempotencyKey
        });

        if (existingTransection) {
            await session.abortTransaction();
            return res.status(409).json({
                message: "Transaction already processed"
            });
        }

        // Find recipient account
        const toUserAccount = await accountModel.findById(toAccount);

        if (!toUserAccount) {
            await session.abortTransaction();
            return res.status(404).json({
                message: "toAccount not found"
            });
        }

        // Find system account
        const fromUserAccount = await accountModel.findOne({
          
            user: req.user._id
        });

        if (!fromUserAccount) {
            await session.abortTransaction();
            return res.status(404).json({
                message: "System account not found"
            });
        }

        // Create transaction
        const [transection] = await transectionModel.create(
            [{
                fromAccount: fromUserAccount._id,
                toAccount: toUserAccount._id,
                amount,
                idempotencyKey,
                status: "Pending"
            }],
            { session }
        );

        // Debit entry
        await ledgerModel.create(
            [{
                account: fromUserAccount._id,
                transection: transection._id,
                amount: -amount,
                type: "DEBIT"
            }],
            { session }
        );

        // Credit entry
        await ledgerModel.create(
            [{
                account: toUserAccount._id,
                transection: transection._id,
                amount: amount,
                type: "CREDIT"
            }],
            { session }
        );

        // Mark completed
        transection.status = "Completed";
        await transection.save({ session });

        await session.commitTransaction();

        return res.status(201).json({
            message: "Initial fund transection created successfully",
            transectionId: transection._id
        });

    } catch (error) {
        await session.abortTransaction();

        return res.status(500).json({
            message: error.message
        });
    } finally {
        session.endSession();
    }
}

module.exports = {
    createTransection,
    createInitialFundsTransection
}