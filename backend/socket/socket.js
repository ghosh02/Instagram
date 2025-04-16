const { Server } = require("socket.io");
const express = require("express");
const app = express();
const http = require("http");
const { on } = require("events");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};
const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`user ${userId} socket ${socket.id} connected`);
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      console.log(`user ${userId} socket ${socket.id} disconnected`);
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
module.exports = { app, io, server, getReceiverSocketId };
