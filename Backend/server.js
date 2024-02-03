// // server.js
// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const connectDB = require("./config/db");
// const userRouter = require("./router/userRouter");
// const chatRouter = require("./router/chatRouter");
// const messageRouter=require("./router/messageRouter")
// const {notFound,errorHandler }= require("./middleware/errorMiddleware");
// const { Socket } = require("socket.io");
// dotenv.config();

// connectDB();

// const app = express();

// // const corsOptions = {
// //   origin: 'http://localhost:3000',  // Update this with your frontend URL
// //   credentials: true,  // If your requests include credentials (cookies, HTTP authentication), set this to true
// // };

// // app.use(cors(corsOptions));

// app.use(cors());


// // app.get("/", (req, res) => {
// //   res.send("This is the API running successfully");
// // });


// app.use(express.json());
// app.use("/api/user",userRouter);
// app.use("/api/chat",chatRouter);
// app.use("/api/message",messageRouter);

// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;
// const server=app.listen(PORT, console.log(`Server start at PORT ${PORT}`));

// // const io=require("socket.io")(server,{
// //   pingTimeout:60000,
// //   cors:{
// //     origin:"http://localhost:3000"
// //   },
// // });

// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: (origin, callback) => {
//       // Check if the origin is allowed
//       const allowedOrigins = ["http://localhost:3000"];
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//   },
// });


// io.on("connection",(socket)=>{
// console.log("connect to socket.io")

// socket.on("setup",(userData)=>{
//   socket.join(userData._id); 
//   console.log(userData._id);
//   socket.emit("connected");
// });

// socket.on("typing",(room)=>socket.in(room).emit("typing"))

// socket.on("stop typing",(room)=>socket.in(room).emit("stop typing"))


// socket.on("join chat",(room)=>{
//   socket.join(room);
// console.log("User Joined Room : "+room)
// })

// socket.on("new message",( newMessageRecieved)=>{
//   console.log(newMessageRecieved)
//   var chat = newMessageRecieved.chat;
//   if(!chat.users) return console.log("chat.users not defined");

//   chat.users.forEach((user) => {
//     console.log(user._id == newMessageRecieved.sender._id )
//     if(user._id == newMessageRecieved.sender._id ) return ;
   
//     socket.in(user._id).emit("message received",newMessageRecieved)
//   });

// })

// socket.off("setup", () => {
//   console.log("USER DISCONNECTED");
//   socket.leave(userData._id);
// });


// });

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRouter = require("./router/userRouter");
const chatRouter = require("./router/chatRouter");
const messageRouter = require("./router/messageRouter");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path =require("path")

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

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
