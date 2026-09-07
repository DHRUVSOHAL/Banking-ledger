const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service.js");
const blackListModel = require("../models/blackList.model.js");
const otpModel = require("../models/Otp.model");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// 🔐 Production-safe cookie helper for cross-origin Render deployment
const getCookieOptions = (maxAgeMs = 24 * 60 * 60 * 1000) => ({
  httpOnly: true,
  maxAge: maxAgeMs,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});

/**
 * @description Register a new user
 */
async function userRegisterController(req, res) {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const isExist = await userModel.findOne({ email: email });
    if (isExist) {
      return res.status(409).json({
        message: "User already exists with this email",
        status: "failed",
      });
    }

    const user = await userModel.create({
      email,
      name,
      password,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // ✅ Cookie options matched with production config
    res.cookie("token", token, getCookieOptions(24 * 60 * 60 * 1000));

    // 📧 Call email service (Non-blocking fail-safe)
    try {
      console.log("Triggering registration email to:", user.email);
      await emailService.sendRegistrationEmail(user.email, user.name);
    } catch (mailErr) {
      console.error("Email service error:", mailErr.message);
    }

    return res.status(201).json({
      message: "User registered successfully",
      status: "success",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Register Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**
 * @description Login user
 */
async function userLoginController(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Validation Check
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Find user and explicitly select password & systemUser
    const user = await userModel.findOne({ email: email }).select("+password +systemUser");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 5. Set Secure Cookie with SameSite=None for Render
    res.cookie("token", token, getCookieOptions(24 * 60 * 60 * 1000));

    // 6. Final Response
    return res.status(200).json({
      message: "User logged in successfully",
      status: "success",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        systemUser: user.systemUser,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function userLogoutController(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({
      message: "No token found in cookies",
    });
  }

  // Clear cookie with exact same flags
  res.clearCookie("token", getCookieOptions());
  await blackListModel.create({ token });

  return res.status(200).json({
    message: "User logged out successfully",
    status: "success",
  });
}

/**
 * @route POST /api/auth/forget-password
 */
async function forgetPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email required hai!" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Khaata nahi mila!" });
    }

    const plainOTP = crypto.randomInt(100000, 999999).toString();
    const hash = await bcrypt.hash(plainOTP, 10);

    await otpModel.findOneAndDelete({ email });
    await otpModel.create({ email, otp: hash });

    await emailService.sendOTPEmail(email, plainOTP);

    // Reset session token (10 mins)
    const resetSession = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    res.cookie("resetSession", resetSession, getCookieOptions(10 * 60 * 1000));

    return res.status(200).json({
      success: true,
      message: "OTP aapke email par bhej diya gaya hai.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function verifyOtp(req, res) {
  try {
    const { otp } = req.body;
    const sessionToken = req.cookies.resetSession;

    if (!sessionToken) {
      return res.status(400).json({
        success: false,
        message: "Session expire ho gaya. Pehle OTP request karein.",
      });
    }

    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
    const email = decoded.email;

    const otpRecord = await otpModel.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP expire ho chuka hai." });
    }

    const isMatch = await bcrypt.compare(
      String(otp).trim(),
      String(otpRecord.otp),
    );
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Galat OTP hai!" });
    }

    // Upgrade session to verified
    const verifiedSession = jwt.sign(
      { email, isVerified: true },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    res.cookie("resetSession", verifiedSession, getCookieOptions(10 * 60 * 1000));
    await otpModel.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      success: true,
      message: "OTP verify ho gaya! Ab naya password enter karein.",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid session ya expire ho gaya" });
  }
}

/**
 * @name resetPassword
 */
async function resetPassword(req, res) {
  try {
    const { newPassword } = req.body;
    const sessionToken = req.cookies.resetSession;

    if (!sessionToken) {
      return res.status(401).json({ success: false, message: "Pehle OTP verify karein!" });
    }

    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
    if (!decoded.isVerified) {
      return res.status(403).json({ success: false, message: "OTP verification zaroori hai!" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password kam se kam 6 characters ka hona chahiye.",
      });
    }

    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User nahi mila!" });
    }

    user.password = newPassword;
    await user.save();

    // 1. Clear temporary reset session
    res.clearCookie("resetSession", getCookieOptions());

    // 2. Direct user login
    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", authToken, getCookieOptions(24 * 60 * 60 * 1000));

    return res.status(200).json({
      success: true,
      message: "Password badal gaya aur aap direct login ho chuke hain!",
      token: authToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        systemUser: user.systemUser,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function getMe(req, res) {
  const user = await userModel.findById(req.user._id).select("+systemUser");
  return res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      systemUser: user.systemUser,
    },
  });
}

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController,
  forgetPassword,
  verifyOtp,
  resetPassword,
  getMe,
};