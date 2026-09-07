const accountModel = require("../models/account.model.js");

const ledgerModel = require("../models/ledger.model.js");

async function createAccount(req, res) {
  const user = req.user;

  const account = await accountModel.create({
    user: user._id,
  });
  res.status(201).json({
    message: "account created successfully",
    status: "success",
    account,
  });
}

async function getAUserAccountsOfUser(req, res) {
  const accounts = await accountModel.find({ user: req.user._id });
  res.status(200).json({
    message: "accounts fetched successfully",
    status: "success",
    accounts,
  });
}

/**
 * GET /api/accounts/balance/:accountId
 * @description get balance of an account
 * protected route, requires authentication
 */
async function getAccountBalance(req, res) {
  const accountId = req.params.accountId;
  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id,
  });
  if (!account) {
    return res.status(404).json({
      message: "account not found or you don't have access to this account",
    });
  }
  const balance = await account.getBalance();
  return res.status(200).json({
    message: "account balance fetched successfully",
    status: "success",
    balance,
  });
}

// controllers/ledger.controller.js

// controllers/ledger.controller.js ya transection.controllers.js
async function getAccountLedgerHistory(req, res) {
  try {
    const { accountId } = req.params;

    // 1. Verify karo ki yeh account isi user ka hai
    const account = await accountModel.findOne({ _id: accountId, user: req.user._id });
    if (!account) {
      return res.status(404).json({ message: "Account not found or unauthorized" });
    }

    // 2. Is specific account ki saari ledger entries nikalo
    const entries = await ledgerModel
      .find({ account: accountId })
      .populate({
        path: 'transection',
        populate: [
          { path: 'fromAccount', select: 'accountNumber user' },
          { path: 'toAccount', select: 'accountNumber user' }
        ]
      })
      .sort({ createdAt: -1 });

    const balance = await account.getBalance();

    return res.status(200).json({
      success: true,
      accountNumber: account.accountNumber || account._id,
      balance,
      entries,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createAccount,
  getAUserAccountsOfUser,
  getAccountBalance,
  getAccountLedgerHistory,
};
