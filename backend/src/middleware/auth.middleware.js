const userModel = require('../models/user.model.js')
const jwt = require('jsonwebtoken')
const tokenBlacklistModel = require('../models/blackList.model.js')


async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access,token missing"
        })
    }
    //check if token is blacklisted
    const isBlackListed = await tokenBlacklistModel.findOne({ token })
    if (isBlackListed) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access,token is blacklisted"
        })
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)//have userId

        const user = await userModel.findById(decode.userId)//to check if user exist or not

        req.user = user;//we will use this user in our controllers to get user details

        next()

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access,invalid token",
        })
    }
}

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access,token missing"
        })
    }
    //check if token is blacklisted
    const isBlackListed = await tokenBlacklistModel.findOne({ token })
    if (isBlackListed) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access,token is blacklisted"
        })
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)//have userId
        const user = await userModel.findById(decode.userId).select("+systemUser")//to check if user exist or not and also get systemUser field
        if (!user || !user.systemUser) {
            return res.status(403).json({
                success: false,
                message: "Forbidden access,system user only"
            })
        }
        req.user = user;//we will use this user in our controllers to get user details
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access,invalid token",
        })
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}
