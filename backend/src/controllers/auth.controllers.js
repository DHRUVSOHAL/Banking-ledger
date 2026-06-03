const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const emailService=require('../services/email.service.js')
const blackListModel=require('../models/blackList.model.js')

/**
 * @description:Register a new user
 */
async function userRegisterController(req, res) {
    const { email, name, password } = req.body
    if (!email || !name || !password) {
        return res.status(401).json({
            success: false,
            message: "All fields are required"
        })
    }

    const isExist = await userModel.findOne({ email: email })
    if (isExist) {
        return res.status(401).json({
            message: "user already exist with this email",
            status: "failed"
        })
    }

    const user = await userModel.create({
        email,
        name,
        password
    })
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" })
    res.cookie("token", token)
    res.status(201).json({
        message: "user registered successfully",
        status: "success",
        token,
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        }
    })
    await emailService.sendRegistrationEmail(user.email,user.name);

}
/**
 * @description:Login user
 */
async function userLoginController(req,res){
    const {email,password}=req.body
    if(!email || !password){
        return res.status(401).json({
            success:false,
            message:"All fields are required"
        })
    }

    const user=await userModel.findOne({email:email},).select("+password")
    if(!user){
        return res.status(401).json({
            success:false,
            message:"Invalid email"
        })
    }
    const isValidPassword=await user.comparePassword(password)
    if(!isValidPassword){
        return res.status(401).json({
            success:false,
            message:"Invalid password"
        })
    }
    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"1d"})
    res.cookie("token",token)
    return res.status(200).json({
        message:"user logged in successfully",
        status:"success",
        token,
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        }
    })
}

async function userLogoutController(req,res){
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(400).json({
            message:"No token found in cookies"
        })
    }
    res.cookie("token","")
    await blackListModel.create({token})
    
    return res.status(200).json({
        message:"user logged out successfully",
        status:"success"
    })

}



module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}