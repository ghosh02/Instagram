const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const upload = require("../middlewares/multer");
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/logout", userController.logout);
router.get("/profile/:id", isAuthenticated, userController.getProfile);
router.post(
  "/profile/edit",
  isAuthenticated,
  upload.single("profilePhoto"),
  userController.editProfile
);
router.get("/suggested", isAuthenticated, userController.getSuggestedUsers);
router.get("/followed", isAuthenticated, userController.getFollowedUsers);
router.post(
  "/followorunfollow/:id",
  isAuthenticated,
  userController.followUnfollow
);

module.exports = router;
