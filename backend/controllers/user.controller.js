const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getDataUri = require("../utils/dataUri");
const cloudinary = require("../utils/cloudinary");
const Post = require("../models/post.model");

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(401).json({ message: "Please fill all the fields" });
    }
    const isUsernameExist = await User.findOne({ username });
    if (isUsernameExist) {
      return res.status(401).json({ message: "Username already exists" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });
    return res
      .status(201)
      .json({ message: "User created successfully", success: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: "Please fill all the fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password1" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password2" });
    }
    const populatedPosts = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post.author.equals(user._id)) {
          return post;
        }
        return null;
      })
    );
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      gender: user.gender,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
      bookmarks: user.bookmarks,
    };
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ message: "Login successful", success: true, userData });
  } catch (error) {
    console.log(error);
  }
};

module.exports.logout = async (req, res) => {
  try {
    return res
      .cookie("token", "", { maxAge: 0 })
      .status(201)
      .json({ message: "Logout successful", success: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate({ path: "posts", createdAt: -1 })
      .populate("bookmarks")
      .select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
  }
};

module.exports.editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (bio) {
      user.bio = bio;
    }
    if (gender) {
      user.gender = gender;
    }
    if (profilePicture) {
      user.profilePicture = cloudResponse.secure_url;
    }
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getSuggestedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const suggestedUsers = await User.find({
      _id: { $nin: [...user.following, req.id] },
    }).select("-password");
    return res.status(200).json({ success: true, suggestedUsers });
  } catch (error) {
    console.log(error);
  }
};
module.exports.getFollowedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const followedUsers = await User.find({
      _id: { $in: user.following },
    }).select("-password");
    return res.status(200).json({ success: true, followedUsers });
  } catch (error) {
    console.log(error);
  }
};

module.exports.followUnfollow = async (req, res) => {
  try {
    const userId = req.id;
    const whomToFollow = req.params.id;
    if (userId == whomToFollow) {
      return res.status(401).json({ message: "You can't follow yourself" });
    }
    const user = await User.findById(userId);
    const targetUser = await User.findById(whomToFollow);
    if (!user || !targetUser) {
      return res.status(401).json({ message: "User not found" });
    }
    const isFollowing = user.following.includes(whomToFollow);
    if (isFollowing) {
      await Promise.all([
        User.updateOne({ _id: userId }, { $pull: { following: whomToFollow } }),
        User.updateOne({ _id: whomToFollow }, { $pull: { followers: userId } }),
      ]);
      return res
        .status(200)
        .json({ success: true, message: "Unfollowed successfully" });
    } else {
      await Promise.all([
        User.updateOne({ _id: userId }, { $push: { following: whomToFollow } }),
        User.updateOne({ _id: whomToFollow }, { $push: { followers: userId } }),
      ]);
      return res
        .status(200)
        .json({ success: true, message: "Followed successfully" });
    }
  } catch (error) {
    console.log(error);
  }
};
