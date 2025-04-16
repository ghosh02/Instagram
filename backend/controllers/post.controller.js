const Post = require("../models/post.model");
const User = require("../models/user.model");
const Comment = require("../models/comment.model");
const sharp = require("sharp");
const cloudinary = require("../utils/cloudinary");
const { getReceiverSocketId, io } = require("../socket/socket");
module.exports.addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;
    if (!image) {
      res.status(400).json({ message: "Please upload an image" });
    }
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 600, fit: "cover" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();
    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }
    await post.populate({ path: "author", select: "-password" });
    return res
      .status(201)
      .json({ message: "Post created successfully", post, success: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture followers",
        },
      });
    return res
      .status(200)
      .json({ success: true, message: "Posts retrieved successfully", posts });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getUSerPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "username profilePicture" },
      });
    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
  }
};

module.exports.likePost = async (req, res) => {
  try {
    const likedUserId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await post.updateOne({ $addToSet: { likes: likedUserId } });
    await post.save();
    const user = await User.findById(likedUserId).select(
      "username profilePicture"
    );
    const postOwnerId = post.author.toString();
    if (user.username !== postOwnerId) {
      const notification = {
        type: "like",
        userId: likedUserId,
        userDetails: user,
        postId,
        message: "liked your post",
      };
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit("Notification", notification);
    }
    return res
      .status(200)
      .json({ success: true, message: "Post liked successfully" });
  } catch (error) {
    console.log(error);
  }
};

module.exports.dislikePost = async (req, res) => {
  try {
    const dislikedUserId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await post.updateOne({ $pull: { likes: dislikedUserId } });
    await post.save();
    const user = await User.findById(dislikedUserId).select(
      "username profilePicture"
    );
    const postOwnerId = post.author.toString();
    if (user.username !== postOwnerId) {
      const notification = {
        type: "like",
        userId: dislikedUserId,
        userDetails: user,
        postId,
        message: "disliked your post",
      };
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit("Notification", notification);
    }
    return res
      .status(200)
      .json({ success: true, message: "Post disliked successfully" });
  } catch (error) {
    console.log(error);
  }
};

module.exports.addComment = async (req, res) => {
  try {
    const commenterId = req.id;
    const postId = req.params.id;
    const { text } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comment = await Comment.create({
      text,
      author: commenterId,
      post: postId,
    });
    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });
    post.comments.push(comment._id);
    await post.save();
    return res
      .status(201)
      .json({ success: true, message: "Comment added successfully", comment });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getAllComments = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username,profilePicture" });
    if (!comments) {
      return res.status(404).json({ message: "Comments not found" });
    }
    return res.status(200).json({ comments });
  } catch (error) {
    console.log(error);
  }
};

module.exports.deletePost = async (req, res) => {
  try {
    const authorId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.author.toString() !== req.id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not the author of this post" });
    }
    await Post.findByIdAndDelete(postId);
    let user = await User.findById(authorId);
    user.posts = user.posts.filter(
      (post) => post.toString() !== postId.toString()
    );
    await user.save();
    await Comment.deleteMany({ post: postId });
    return res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
  }
};

module.exports.bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const user = await User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      return res
        .status(200)
        .json({
          type: "unsaved",
          message: "Post removed from bookmarks",
          success: true,
        });
    } else {
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      await user.save();
      return res
        .status(200)
        .json({
          type: "saved",
          message: "Post added to bookmarks",
          success: true,
        });
    }
  } catch (error) {
    console.log(error);
  }
};
