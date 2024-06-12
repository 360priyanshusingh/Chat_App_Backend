
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRouter = require("./router/userRouter");
const chatRouter = require("./router/chatRouter");
const adminRouter = require("./router/adminRouter");
const messageRouter = require("./router/messageRouter");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path =require("path")
const AdminModel = require("./models/AdminModel")
const FeedBackModel = require("./models/Feedback")
dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.static('backend/public'));
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/admin", adminRouter);

// ------------deployment------------

const __dirname1 = path.resolve();
if(process.env.NODE_ENV==="production"){
app.use(express.static(path.join(__dirname1,"frontend/build")));
app.get("*",(req,res)=>{
  res.sendFile(path.resolve(__dirname1,"frontend","build","index.html"));
});

}
else {
  app.get("/",(req,res)=>{
    res.send("API is Runing Successfully");
  })
}


// -------------deployment------------

app.use(notFound);
app.use(errorHandler);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("connect to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("typing", (room) => io.in(room).emit("typing"));

  socket.on("stop typing", (room) => io.in(room).emit("stop typing"));

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("new message", (newMessageReceived) => {
    console.log(newMessageReceived);
    const chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      console.log(user._id == newMessageReceived.sender._id);
      if (user._id == newMessageReceived.sender._id) return;

      io.in(user._id).emit("message received", newMessageReceived);
    });
  });
});



const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server start at PORT ${PORT}`);
});
