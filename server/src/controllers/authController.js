import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const MAX_AVATAR_LENGTH = 1_500_000;

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

// REGISTER
export const register = async (req, res) => {
  const { username, email, password, avatar } = req.body; //  correct

  try {
    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const normalizedAvatar = normalizeAvatar(avatar);

    if (normalizedAvatar === null) {
      return res.status(400).json({ message: "Please upload a valid profile photo." });
    }

    const user = await User.create({
      username: username?.trim(),
      email: email?.trim().toLowerCase(),
      password,
      avatar: normalizedAvatar,
    });

    const token = generateToken(user._id); // fixed

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      token,
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

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // compare password
    const isMatch = await user.matchPassword(password); //  important

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
      _id: { $ne: req.user._id }, //$ne => not equal : mogodb query operator 
    };

    if (search) {
      query.username = { $regex: search, $options: "i" };  // %regex: find users finding the pattern(lets to find the text)
    }

    const users = await User.find(query)
      .select("username email avatar createdAt")
      .sort({ username: 1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to load users" });
  }
};
