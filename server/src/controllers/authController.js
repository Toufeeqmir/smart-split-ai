import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import otpGenerator from "otp-generator";

const MAX_AVATAR_LENGTH = 1_500_000;

//this helper function validates the uploaded profile picture
const normalizeAvatar = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (!trimmedValue.startsWith("data:image/")) {
    return null;
  }

  if (trimmedValue.length > MAX_AVATAR_LENGTH) {
    return null;
  }

  return trimmedValue;
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const generateOtp = () =>
  otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

// REGISTER — only creates a PendingUser, not a real User yet
export const register = async (req, res) => {
  const { username, email, password, avatar } = req.body;

  try {
    if (!username?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username, email and password" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // block if a real, already-verified account owns this email
    const userExist = await User.findOne({ email: normalizedEmail });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const normalizedAvatar = normalizeAvatar(avatar);
    if (normalizedAvatar === null) {
      return res.status(400).json({ message: "Please upload a valid profile photo." });
    }

    const otp = generateOtp();

    // if they started registering before but never verified, restart
    // their pending registration with a fresh OTP instead of blocking them
    await PendingUser.deleteOne({ email: normalizedEmail });

    const pendingUser = await PendingUser.create({
      username: username.trim(),
      email: normalizedEmail,
      password,
      avatar: normalizedAvatar,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
    });

    try {
      await sendEmail(
        pendingUser.email,
        "Email verification",
        `Your verification OTP is ${otp}. It will expire in 5 minutes`
      );
    } catch (emailError) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return res.status(500).json({
        message: "Could not send verification email. Please try registering again",
      });
    }

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully. Please verify your email",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY OTP — this is the moment the REAL user actually gets created
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const pendingUser = await PendingUser.findOne({ email: normalizedEmail });

    if (!pendingUser) {
      return res.status(400).json({ message: "No pending registration found for this email" });
    }

    if (pendingUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (pendingUser.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new OTP" });
    }

    // OTP correct — create the permanent, real user now
    const user = await User.create({
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.password,
      avatar: pendingUser.avatar,
    });

    // pending record's job is done
    await PendingUser.deleteOne({ _id: pendingUser._id });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESEND OTP — now operates on PendingUser, not User
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Please provide an email" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const pendingUser = await PendingUser.findOne({ email: normalizedEmail });

    if (!pendingUser) {
      return res.status(400).json({ message: "No pending registration found for this email" });
    }

    const otp = generateOtp();
    pendingUser.otp = otp;
    pendingUser.otpExpiry = Date.now() + 5 * 60 * 1000;
    await pendingUser.save();

    await sendEmail(
      pendingUser.email,
      "Email verification",
      `Your new verification OTP is ${otp}. It will expire in 5 minutes`
    );

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      // give a more helpful message if they registered but never verified,
      // instead of just a generic "invalid credentials"
      const pendingUser = await PendingUser.findOne({ email: normalizedEmail });
      if (pendingUser) {
        return res.status(403).json({
          message: "Please verify your email before logging in",
          notVerified: true,
        });
      }
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROFILE
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "User profile",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const normalizedAvatar = normalizeAvatar(req.body.avatar);

    if (normalizedAvatar === null) {
      return res.status(400).json({ message: "Please upload a valid profile photo." });
    }

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.avatar = normalizedAvatar;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// LIST USERS
export const listUsers = async (req, res) => {
  try {
    const search = req.query.search?.trim();
    const query = {
      _id: { $ne: req.user._id },
    };

    if (search) {
      query.username = { $regex: escapeRegex(search), $options: "i" };
    }

    const users = await User.find(query)
      .select("username email avatar createdAt")
      .sort({ username: 1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to load users" });
  }
};