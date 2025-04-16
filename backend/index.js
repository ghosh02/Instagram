const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./utils/db");
const userRoute = require("./routes/user.route");
const postRoute = require("./routes/post.route");
const messageRoute = require("./routes/message.route");
const { app, server } = require("./socket/socket");
const path = require("path");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

const filePath = path.join(__dirname, "../frontend/dist");
console.log(filePath);

app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

app.use(express.static(filePath));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
});

server.listen(process.env.PORT, () => {
  connectDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});
