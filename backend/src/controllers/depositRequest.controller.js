const depositRequestModel = require('../models/depositRequest.model.js');
const accountModel = require('../models/account.model.js');
const userModel = require('../models/user.model.js');
const { processInitialFunds } = require('./transection.controllers.js');

const AUTO_APPROVE_LIMIT = 50000; // 👈 threshold — isse zyada ho to admin approval chahiye

// USER: naya deposit request banata hai
async function createDepositRequest(req, res) {
  const { accountId, amount, idempotencyKey } = req.body;

  if (!accountId || !amount || amount <= 0 || !idempotencyKey) {
    return res.status(400).json({ message: "Valid accountId, amount and idempotencyKey are required" });
  }

  const account = await accountModel.findOne({ _id: accountId, user: req.user._id });
  if (!account) {
    return res.status(404).json({ message: "Account not found or you don't have access" });
  }

  const existing = await depositRequestModel.findOne({ idempotencyKey });
  if (existing) {
    return res.status(200).json({ message: "Request already submitted", request: existing });
  }

  // ✅ Case 1: Amount threshold ke andar hai — turant auto-approve
  if (amount <= AUTO_APPROVE_LIMIT) {
    // Koi bhi system user (admin) ka account dhoondo jahan se paisa DEBIT hoga
    const systemUser = await userModel.findOne({ systemUser: true }).select("+systemUser");
    if (!systemUser) {
      return res.status(500).json({ message: "No system account configured for deposits" });
    }

    const result = await processInitialFunds({
      toAccount: accountId,
      amount,
      idempotencyKey,
      systemUserId: systemUser._id,
    });

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    const request = await depositRequestModel.create({
      user: req.user._id,
      account: accountId,
      amount,
      idempotencyKey,
      status: 'APPROVED',
      reviewedBy: systemUser._id,
      reviewedAt: new Date(),
    });

    return res.status(201).json({
      message: "Deposit completed instantly",
      request,
      transectionId: result.transectionId,
    });
  }

  // ❌ Case 2: Amount threshold se zyada hai — admin approval chahiye
  const request = await depositRequestModel.create({
    user: req.user._id,
    account: accountId,
    amount,
    idempotencyKey,
    status: 'PENDING',
  });

  return res.status(201).json({
    message: `Amount exceeds ₹${AUTO_APPROVE_LIMIT}. Deposit request submitted, waiting for admin approval`,
    request,
  });
}

// baaki functions (getMyDepositRequests, getPendingDepositRequests, approveDepositRequest, rejectDepositRequest) same rahenge — koi change nahi

async function getMyDepositRequests(req, res) {
  const requests = await depositRequestModel.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json({ requests });
}

async function getPendingDepositRequests(req, res) {
  const requests = await depositRequestModel
    .find({ status: 'PENDING' })
    .populate('user', 'name email')
    .populate('account')
    .sort({ createdAt: 1 });
  return res.status(200).json({ requests });
}

async function approveDepositRequest(req, res) {
  const { requestId } = req.params;

  const request = await depositRequestModel.findById(requestId);
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }
  if (request.status !== 'PENDING') {
    return res.status(400).json({ message: `Request already ${request.status}` });
  }

  const result = await processInitialFunds({
    toAccount: request.account,
    amount: request.amount,
    idempotencyKey: `deposit-${request._id}`,
    systemUserId: req.user._id,
  });

  if (result.error) {
    return res.status(result.status).json({ message: result.error });
  }

  request.status = 'APPROVED';
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  return res.status(200).json({ message: "Deposit approved successfully", request, transectionId: result.transectionId });
}

async function rejectDepositRequest(req, res) {
  const { requestId } = req.params;
  const request = await depositRequestModel.findByIdAndUpdate(
    requestId,
    { status: 'REJECTED', reviewedBy: req.user._id, reviewedAt: new Date() },
    { new: true }
  );
  if (!request) return res.status(404).json({ message: "Request not found" });
  return res.status(200).json({ message: "Request rejected", request });
}

module.exports = {
  createDepositRequest,
  getMyDepositRequests,
  getPendingDepositRequests,
  approveDepositRequest,
  rejectDepositRequest,
};