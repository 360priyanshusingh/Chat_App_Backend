const asyncHandler =require('express-async-handler')

const Message =require('../models/messageModel');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const jwt=require("jsonwebtoken");




const sendMessage = asyncHandler(async (req, res) => {
  try {

    const { content, chatId } = req.body;
    

    if (!content || !chatId) {
      console.log("Invalid data passed into request");
      return res.status(400).json({ error: "Invalid data passed into request" });
    }

    const newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

    // Create a new message
    var  message = await Message.create(newMessage);

    // Populate necessary fields
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Update the latest message in the chat
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    // Respond with the created message
    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const allMessages= asyncHandler(async(req,res)=>{
   try {
    const message= await Message.find({chat:req.params.chatId})
    .populate("sender","name pic email")
    .populate("chat")

    res.json(message)
   } catch (error) {
    res.status(400);
    throw new Error(error.massage);
   }
});

module.exports = { sendMessage , allMessages};

