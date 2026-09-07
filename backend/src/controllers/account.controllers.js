const accountModel = require("../models/account.model.js");
const ledgerModel = require("../models/ledger.model.js");

/**
 * POST /api/accounts
 * @description Create a new account for the authenticated user
 */
async function createAccount(req, res) {
  try {
    const user = req.user;

    const account = await accountModel.create({
      user: user._id,
    });

    return res.status(201).json({
      message: "account created successfully",
      status: "success",
      account,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create account",
      error: error.message,
    });
  }
}

/**
 * GET /api/accounts
 * @description Get all accounts of the logged-in user with their current balances
 */
async function getAUserAccountsOfUser(req, res) {
  try {
    const accounts = await accountModel.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Parallel balance resolution taaki Dashboard ko direct balance mil sake
    const accountsWithBalance = await Promise.all(
      accounts.map(async (acc) => {
        const balance = typeof acc.getBalance === 'function' ? await acc.getBalance() : 0;
        return {
          ...acc.toObject(),
          balance,
        };
      })
    );

    return res.status(200).json({
      message: "accounts fetched successfully",
      status: "success",
      accounts: accountsWithBalance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch accounts",
      error: error.message,
    });
  }
}

/**
 * GET /api/accounts/balance/:accountId
 * @description Get balance of a specific account
 */
async function getAccountBalance(req, res) {
  try {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "account not found or you don't have access to this account",
      });
    }

    const balance = await account.getBalance();

    return res.status(200).json({
      message: "account balance fetched successfully",
      status: "success",
      balance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch account balance",
      error: error.message,
    });
  }
}

/**
 * GET /api/accounts/:accountId/history
 * @description Get immutable ledger audit history for an account
 */
async function getAccountLedgerHistory(req, res) {
  try {
    const { accountId } = req.params;

    // 1. Verify account ownership
    const account = await accountModel.findOne({ _id: accountId, user: req.user._id });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found or unauthorized",
      });
    }

    // 2. Fetch ledger entries
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
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ledger history",
      error: error.message,
    });
  }
}

module.exports = {
  createAccount,
  getAUserAccountsOfUser,
  getAccountBalance,
  getAccountLedgerHistory,
};