const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const upload = require("../middlewares/multer");

router.post(
  "/addpost",
  isAuthenticated,
  upload.single("image"),
  postController.addNewPost
);
router.get("/allposts", isAuthenticated, postController.getAllPost);
router.get("/user/allposts", isAuthenticated, postController.getUSerPost);
router.get("/like/:id", isAuthenticated, postController.likePost);
router.get("/dislike/:id", isAuthenticated, postController.dislikePost);
router.post("/comment/:id", isAuthenticated, postController.addComment);
router.get("/allcomments/:id", isAuthenticated, postController.getAllComments);
router.delete("/delete/:id", isAuthenticated, postController.deletePost);
router.get("/bookmarkpost/:id", isAuthenticated, postController.bookmarkPost);

module.exports = router;
