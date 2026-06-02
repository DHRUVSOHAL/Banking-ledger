const transectionModel = require('../models/transection.model.js')


const ledgerModel = require('../models/ledger.model.js')
const userModel = require('../models/user.model.js')

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

    /**
     * validate request
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const fromUserAccount = await accountModel.findById(fromAccount);
    if (!fromUserAccount) {
        return res.status(404).json({ message: "fromAccount not found" })
    }
    const toUserAccount = await accountModel.findById(toAccount);
    if (!toUserAccount) {
        return res.status(404).json({ message: "toAccount not found" })
    }

    /**
     * validate idempotencykey(same transection should not be processed twice)
     */
    const isTransectionAlreadyExists = await transectionModel.findOne({ idempotencyKey: idempotencyKey })
    if (isTransectionAlreadyExists) {
        if (isTransectionAlreadyExists.status === "Completed") {
            return res.status(200).json({
                message: "Transection already processed",
                transection: isTransectionAlreadyExists
            })
        }
        else if (isTransectionAlreadyExists.status === "Pending") {
            return res.status(200).json({
                message: "Transection is being processed",
                transection: isTransectionAlreadyExists
            })
        }
        else {
            return res.status(409).json({
                message: "Transection with this idempotencyKey already exists",

            })
        }
    }
    /**
     * checking account status
     */
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({ message: "Both accounts must be active for transection" })
    }
    const fromUser=await userModel.findById(fromUserAccount.user);
    const toUser=await userModel.findById(toUserAccount.user);
    /**
     * checking sender balance from ledger
     */
    const ballance = await fromUserAccount.getBalance();
    if (ballance < amount) {
        return res.status(400).json({ message: `Balance is insufficient for this transection. Current balance is ${ballance}` })
    }
    /**
     * creating transection
     */
    const session = await mongoose.startSession();
    session.startTransaction()

    const [transection] = await transectionModel.create(
        [{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "Pending"
        }],
        { session }
    );
    if (fromAccount === toAccount) {
        return res.status(400).json({
            message: "Cannot transfer to same account"
        });
    }
    await ledgerModel.create(
        [{
            account: fromAccount,
            transection: transection._id,
            amount: amount,
            type: "DEBIT"
        }],
        { session }
    );

    await ledgerModel.create(
        [{
            account: toAccount,
            transection: transection._id,
            amount: amount,
            type: "CREDIT"
        }],
        { session }
    );

    transection.status = "Completed"
    await transection.save({ session })
    await session.commitTransaction()
    session.endSession()

    /**
     * sending email notification to sender and receiver about transection
     */


    try {
        await emailService.senderTransectionEmail(fromUser.email, fromUser.name, amount, toAccount);
        await emailService.receiverTransectionEmail(toUser.email, toUser.name, amount, fromAccount);
    } catch (err) {
        console.error("Email error:", err);
    }

    res.status(201).json({
        message: "Transection completed successfully",
        transectionId: transection
    })




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
                amount: amount,
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