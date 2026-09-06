const transectionModel = require("../models/transection.model.js");
const ledgerModel = require("../models/ledger.model.js");
const userModel = require("../models/user.model.js");
const emailService = require("../services/email.service.js");
const accountModel = require("../models/account.model.js");
const mongoose = require("mongoose");

async function createTransection(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const fromUserAccount = await accountModel.findById(fromAccount);
  if (!fromUserAccount) {
    return res.status(404).json({ message: "fromAccount not found" });
  }

  if (fromUserAccount.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You don't have access to this account" });
  }

  const toUserAccount = await accountModel.findById(toAccount);
  if (!toUserAccount) {
    return res.status(404).json({ message: "toAccount not found" });
  }

  if (fromAccount === toAccount) {
    return res.status(400).json({ message: "Cannot transfer to same account" });
  }

  const isTransectionAlreadyExists = await transectionModel.findOne({ idempotencyKey });
  if (isTransectionAlreadyExists) {
    if (isTransectionAlreadyExists.status === "Completed") {
      return res.status(200).json({
        message: "Transection already processed",
        transection: isTransectionAlreadyExists,
      });
    } else if (isTransectionAlreadyExists.status === "Pending") {
      return res.status(200).json({
        message: "Transection is being processed",
        transection: isTransectionAlreadyExists,
      });
    } else {
      return res.status(409).json({
        message: "Transection failed previously, please try again",
        transection: isTransectionAlreadyExists,
      });
    }
  }

  if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
    return res.status(400).json({ message: "Both accounts must be active for transection" });
  }

  const fromUser = await userModel.findById(fromUserAccount.user);
  const toUser = await userModel.findById(toUserAccount.user);

  const balance = await fromUserAccount.getBalance();
  if (balance < amount) {
    return res.status(400).json({
      message: `Balance is insufficient for this transection. Current balance is ${balance}`,
    });
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const [transection] = await transectionModel.create(
      [{ fromAccount, toAccount, amount, idempotencyKey, status: "Pending" }],
      { session }
    );

    await ledgerModel.create(
      [{ account: fromAccount, transection: transection._id, amount, type: "DEBIT" }],
      { session }
    );

    await ledgerModel.create(
      [{ account: toAccount, transection: transection._id, amount, type: "CREDIT" }],
      { session }
    );

    await transectionModel.findByIdAndUpdate(transection._id, { status: "Completed" }, { session });
    await session.commitTransaction();
    session.endSession();

    try {
      await emailService.senderTransectionEmail(fromUser.email, fromUser.name, amount, toAccount);
      await emailService.receiverTransectionEmail(toUser.email, toUser.name, amount, fromAccount);
    } catch (emailErr) {
      console.error("Email error:", emailErr);
    }

    return res.status(201).json({
      message: "Transection completed successfully",
      transectionId: transection._id,
    });
  } catch (err) {
    console.error("Transaction error:", err);
    emailService
      .sendTransectionFailureEmail(fromUser.email, fromUser.name, amount, toAccount)
      .catch((emailErr) => console.error("Email error:", emailErr));

    return res.status(400).json({ message: "Transection failed" });
  }
}

/**
 * Reusable core logic — system account se kisi bhi account mein fund transfer karta hai.
 */
async function processInitialFunds({ toAccount, amount, idempotencyKey, systemUserId }) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingTransection = await transectionModel.findOne({ idempotencyKey });
    if (existingTransection) {
      await session.abortTransaction();
      return { error: "Transaction already processed", status: 409 };
    }

    const toUserAccount = await accountModel.findById(toAccount);
    if (!toUserAccount) {
      await session.abortTransaction();
      return { error: "toAccount not found", status: 404 };
    }

    const fromUserAccount = await accountModel.findOne({ user: systemUserId });
    if (!fromUserAccount) {
      await session.abortTransaction();
      return { error: "System account not found", status: 404 };
    }

    // 👇 NAYA — system account ka balance check
    const systemBalance = await fromUserAccount.getBalance();
    if (systemBalance < amount) {
      await session.abortTransaction();
      return { error: "System account has insufficient funds", status: 400 };
    }

    const [transection] = await transectionModel.create(
      [{ fromAccount: fromUserAccount._id, toAccount: toUserAccount._id, amount, idempotencyKey, status: "Pending" }],
      { session }
    );

    await ledgerModel.create(
      [{ account: fromUserAccount._id, transection: transection._id, amount, type: "DEBIT" }],
      { session }
    );

    await ledgerModel.create(
      [{ account: toUserAccount._id, transection: transection._id, amount, type: "CREDIT" }],
      { session }
    );

    transection.status = "Completed";
    await transection.save({ session });

    await session.commitTransaction();
    return { transectionId: transection._id };
  } catch (error) {
    await session.abortTransaction();
    return { error: error.message, status: 500 };
  } finally {
    session.endSession();
  }
}

/**
 * Route handler — direct API call ke liye
 */
async function createInitialFundsTransection(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !idempotencyKey || !amount || amount <= 0) {
    return res.status(400).json({
      message: "Valid toAccount, amount and idempotencyKey are required",
    });
  }

  const result = await processInitialFunds({
    toAccount,
    amount,
    idempotencyKey,
    systemUserId: req.user._id,
  });

  if (result.error) {
    return res.status(result.status).json({ message: result.error });
  }

  return res.status(201).json({
    message: "Initial fund transection created successfully",
    transectionId: result.transectionId,
  });
}

module.exports = {
  createTransection,
  createInitialFundsTransection,
  processInitialFunds,
};