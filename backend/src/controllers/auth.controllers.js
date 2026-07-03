const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const emailService=require('../services/email.service.js')
const blackListModel=require('../models/blackList.model.js')
const otpModel = require("../models/Otp.model")

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
/**
 * @description:Login user
 */
async function userLoginController(req, res) {
    try {
        const { email, password } = req.body;
        
        // 1. Validation Check
        if (!email || !password) {
            return res.status(400).json({ // Changed status from 401 to 400 (Bad Request)
                success: false,
                message: "All fields are required"
            });
        }

        // 2. Find user and explicitly select password
        const user = await userModel.findOne({ email: email }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password" // Security Best Practice: Don't specify exactly what failed
            });
        }

        // 3. Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 4. Generate JWT Token
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET_KEY, 
            { expiresIn: "1d" }
        );

        // 5. Set Secure Cookie
        res.cookie("token", token, {
            httpOnly: true, // Prevents XSS attacks (JS cannot read token)
            maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            sameSite: "strict" // Prevents CSRF attacks
        });

        // 6. Final Response
        return res.status(200).json({
            message: "User logged in successfully",
            status: "success",
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
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


/**
 * @route POST /api/auth/forget-password
 * @description  it will take email as input and send otp and match
 * @access private
 */

async function forgetPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email required hai!" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(440).json({
                success: false,
                message: "Khaata nahi mila! Pehle register karein."
            });
        }
        const plainOTP = crypto.randomInt(100000, 999999).toString();
        const hash = await bcrypt.hash(plainOTP, 10);

        await otpModel.findOneAndDelete({ email });
        await otpModel.create({
            email: email,
            otp: hash
        });

       
        console.log(`\n📩 [TESTING] OTP sent to ${email} -> PLAIN OTP: ${plainOTP}\n`);

        
        await sendOTPEmail(email, plainOTP);
        
        return res.status(200).json({
            success: true,
            message: "OTP aapke email par bhej diya gaya hai."
        });

    } catch (error) {
        console.error("Error in forgetPassword:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}
async function verifyOtp(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email aur OTP dono zaroori hain!" });
        }

       
        const otpRecord = await otpModel.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP expire ho chuka hai ya galat email hai. Naya OTP request karein."
            });
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Galat OTP hai! Kripya check karke dubara dalein." });
        }

        
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(444).json({ success: false, message: "User nahi mila!" });
        }

    
        const resetToken = jwt.sign(
            {
                id: user._id,
                purpose: "reset-password" 
            },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );
        res.cookie("resetToken", resetToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 10 * 60 * 1000 
        });

        await otpModel.deleteOne({ _id: otpRecord._id });

        return res.status(200).json({
            success: true,
            message: "OTP verification safal raha! Ab aap password badal sakte hain.",
        });

    } catch (error) {
        console.error("Error in verifyOtp:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}


/**
 * @name resetPassword
 * @description Reset user password after valid OTP token verification
 * @access Protected (via verifyResetToken middleware)
 */

async function resetPassword(req, res) {
    try {
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: "Naya password dalna zaroori hai!"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password kam se kam 6 characters ka hona chahiye."
            });
        }

        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User nahi mila!"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        
        user.password = hashedPassword;
        await user.save();

        res.clearCookie("resetToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000 // 1 din
        });

        return res.status(200).json({
            success: true,
            message: "Password badal gaya hai aur aap login ho chuke hain!",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Error in resetPassword:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}



module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}