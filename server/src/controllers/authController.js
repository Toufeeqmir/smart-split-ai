import User from "../models/User.js";
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

  // image must be base64 
  if (!trimmedValue.startsWith("data:image/")) {
    return null;
  }

  //size limit
  if (trimmedValue.length > MAX_AVATAR_LENGTH) {
    return null;
  }

  return trimmedValue;
};

// helper to escape regex special characters so search input can't break
// or abuse the $regex query (ReDoS / invalid pattern protection)
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// helper to generate a 6-digit numeric OTP
const generateOtp = () =>
  otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

// REGISTER
export const register = async (req, res) => {
  const { username, email, password, avatar } = req.body;

  try {
    if (!username?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username, email and password" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userExist = await User.findOne({ email: normalizedEmail });

    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    //  validate avatar
    const normalizedAvatar = normalizeAvatar(avatar);

    if (normalizedAvatar === null) {
      return res.status(400).json({ message: "Please upload a valid profile photo." });
    }

    //Generate 6-digit OTP
    const otp = generateOtp();

    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password,
      avatar: normalizedAvatar,
       otp,
       otpExpiry: Date.now() + 5 *60 *1000,
       isVerified: false,
    });

    // Send OTP email
    try{
     await sendEmail(
      user.email,
      "Email verification",
      `Your verification OTP is ${otp}. It will expire in 5 minutes`
     );
    } catch(emailError){
       await User.deleteOne({ _id: user._id });
       return res.status(500).json({
         message: "Could not send verification email. Please try registering again",
       })
    }
     return res.status(201).json({
       success: true,
       message: "OTP sent successfully. Please verify your email",
     });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

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

// RESEND OTP
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Please provide an email" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmail(
      user.email,
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
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // compare password
    const isMatch = await user.matchPassword(password); //  important

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        notVerified: true,
      });
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
      _id: { $ne: req.user._id }, //$ne => not equal : mogodb query operator 
    };

    if (search) {
      query.username = { $regex: escapeRegex(search), $options: "i" };  // %regex: find users finding the pattern(lets to find the text), escaped to avoid ReDoS/invalid patterns
    }

    const users = await User.find(query)
      .select("username email avatar createdAt")
      .sort({ username: 1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to load users" });
  }
};