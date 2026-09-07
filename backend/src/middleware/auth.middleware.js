const userModel = require('../models/user.model.js');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blackList.model.js');

async function authMiddleware(req, res, next) {
  try {
    // 1. Safe extraction (Cookie ya Bearer header)
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access, token missing',
      });
    }

    // 2. Blacklist check
    const isBlackListed = await tokenBlacklistModel.findOne({ token });
    if (isBlackListed) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access, token is blacklisted',
      });
    }

    // 3. Token verify & user existence check
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decode.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access, user no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access, invalid or expired token',
    });
  }
}

async function authSystemUserMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access, token missing',
      });
    }

    const isBlackListed = await tokenBlacklistModel.findOne({ token });
    if (isBlackListed) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access, token is blacklisted',
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decode.userId).select('+systemUser');

    if (!user || !user.systemUser) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden access, system user only',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access, invalid or expired token',
    });
  }
}

module.exports = {
  authMiddleware,
  authSystemUserMiddleware,
};