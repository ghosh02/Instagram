const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
} = require("../controllers/message.controller");
const { isAuthenticated } = require("../middlewares/isAuthenticated");

router.post("/send/:id", isAuthenticated, sendMessage);
router.get("/all/:id", isAuthenticated, getMessages);

module.exports = router;
