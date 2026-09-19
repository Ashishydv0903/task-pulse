const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const crypto = require('crypto');

const sendEmail = require('../utils/sendEmail');

// @desc    Forgot Password - Send 6-digit OTP to user email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email' });
    }

    // Generate 6-digit OTP
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // Build email HTML template
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #0f172a; color: #f8fafc;">
        <h2 style="color: #6366f1; margin-bottom: 8px;">TaskPulse Verification Code</h2>
        <p style="color: #94a3b8; font-size: 14px;">Hello ${user.name},</p>
        <p style="color: #94a3b8; font-size: 14px;">We received a request to reset your password. Use the 6-digit verification code below:</p>
        <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0; border: 1px dashed #6366f1;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #10b981;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">This OTP code expires in <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: `Your TaskPulse Verification Code: ${otp}`,
        html: htmlMessage
      });

      res.json({
        success: true,
        message: `A 6-digit verification code has been sent to ${user.email}.`
      });
    } catch (emailErr) {
      console.error('[EMAIL ERROR]:', emailErr);
      user.otpHash = undefined;
      user.otpExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Failed to send OTP email. Please check server email setup.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with 6-digit OTP code
// @route   PUT /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email, 6-digit OTP code, and new password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Hash provided OTP for lookup
    const otpHash = crypto
      .createHash('sha256')
      .update(otp.toString().trim())
      .digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      otpHash,
      otpExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired 6-digit OTP code' });
    }

    // Set new password (triggers bcrypt hashing in pre-save hook)
    user.password = password;
    user.otpHash = undefined;
    user.otpExpire = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! Logging you in...',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword
};
