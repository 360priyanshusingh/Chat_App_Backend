const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const jwt=require("jsonwebtoken");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected

const accessChat = asyncHandler(async (req,res,next) => {

  
    const {userId}= req.body;  
    // const token = req.headers.authorization.split(" ")[1];
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded Token:", decoded); // Log the decoded token
    // req.user = await User.findById(decoded.id).select("-password");
    // console.log("User from DB:", req.user._id); // Log the user fetched from the database
 console.log(req.user );
  if (!userId) {
    return res.status(400).json({ error: 'UserId param not sent with request' });
  }
   
  if (!req.user || !req.user._id) {
    return res.status(450).json({ error: 'req user is param not sent with request' }); // or handle unauthorized access appropriately
  } 

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
 

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

   
    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// const fetchChats=asyncHandler(async(req,res)=>{
 
//   try {
//     Chat.find({users :{$elemMatch:{$eq:req.user._id}}})
//     .populate("users","password")
//     .populate({path: "users",select: "name",})
//     .populate("groupAdmin","-password")
//     .populate("latestMassage")
//     .sort({updatedAt:-1})
//     .then(async(result)=>{
//       result= await User.populate(result,{
//         path:"latestMassage.sender",
//         select:"name pic email",
//       })
//       res.status(200).json(result)
//     }
//     );
  
//    } catch (error) {
//     res.status(700).json({error:"result is not showing"});
//   }
// });


const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate({
        path: "users",
        select: "name pic email", // Add the fields you want to populate for the 'users' array
      })
      .populate("groupAdmin", "-password")
      .populate({
        path: "latestMassage",
        populate: {
          path: "sender",
          select: "name pic email", // Add the fields you want to populate for 'sender' in 'latestMassage'
        },
      })
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        res.status(200).json(result);
      });
  } catch (error) {
    res.status(500).json({ error: "Error fetching chats" });
  }
});

const createGroupChat= asyncHandler(async(req,res)=>{
  console.log(req.body)
  if(!req.body.users || !req.body.name){
  return res.status(400).send({massage:"please Fill all the feilds"})
  }

  var users = JSON.parse(req.body.users);

  if(users.length<2){
    return res.status(400).send("More than 2 users are required to form a group chat")
  }

  users.push(req.user);
  try {
    const groupChat= await Chat.create({
      chatName : req.body.name,
      users:users,
      isGroupChat:true,
      groupAdmin:req.user,
    });

    const fullGroupChat= await Chat.findOne({_id:groupChat._id})
    .populate("users","-password")
    .populate("groupAdmin","-password");

    res.status(200).json(fullGroupChat);
    
  } catch (error) {
    res.status(400);
    throw new Error(error.massage)
  }

});

// const renameGroup= asyncHandler(async(req,res)=>{
//   const { chatId,chatName } = req.body;

//   const updatedchat= await Chat.findByIdAndUpdate(
//     chatId,
//     {
//       chatName,
//     },
//     {
//       new:true,
//     }
//   )
//   .populate("users","-password")
//   .populate("groupAdmin","-password")

//   if(!updatedchat){
    
//     res.status(404).json({ message: "Chat Not Found" });
//   }
//   else {
//     res.status(500).send(updatedchat);
//   }

// })
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404).json({ message: "Chat Not Found" });
    } else {
      res.status(200).json(updatedChat);
    }
  } catch (error) {
    console.error("Error in renameGroup:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// const addToGroup= asyncHandler(async(req,res)=>{
//   const { chatId,userId } = req.body;

//   const added= await Chat.findByIdAndUpdate(
//     chatId,
//     {
//       $push:{users:userId}
//     },
//     {
//       new:true,
//     }
//   )
//   .populate("users","-password")
//   .populate("groupAdmin","-password")

//   if(!added){
//     res.status(404);
//     throw new Error("we can not add")
//   }
//   else {
//     res.status(500).send(added);
//   }
// })
// const removeFromGroup=asyncHandler(async(req,res)=>{
//   const { chatId,userId } = req.body;

//   const remove= await Chat.findByIdAndUpdate(
//     chatId,
//     {
//       $pull:{users:userId}
//     },
//     {
//       new:true,
//     }
//   )
//   .populate("users","-password")
//   .populate("groupAdmin","-password")

//   if(!remove){
//     res.status(404);
//     throw new Error("Remove does not find")
//   }
//   else {
//     res.status(500).send(remove);
//   }
// })
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId }
      },
      {
        new: true
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(404).json({ message: "We cannot add" });
    } else {
      res.status(200).json(added);
    }
  } catch (error) {
    console.error("Error in addToGroup:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const remove = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId }
      },
      {
        new: true
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!remove) {
      res.status(404).json({ message: "Remove does not find" });
    } else {
      res.status(200).json(remove);
    }
  } catch (error) {
    console.error("Error in removeFromGroup:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = { accessChat ,removeFromGroup,addToGroup,fetchChats,renameGroup,createGroupChat};
