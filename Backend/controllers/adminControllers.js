const asyncHandler = require('express-async-handler');
const express = require('express');
const AdminModel = require('../models/AdminModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const  jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');
const { default: mongoose } = require('mongoose');
const FeedBackModel=require("../models/Feedback");
const Message = require('../models/messageModel');


const viewActiveUser= asyncHandler(async(req,res)=>{
    
    User.find({status:"active"}).
    then((result)=>{
      return res.status(200).json({msg:"We find data Succesfully",result})
    }).
    catch((err)=>{
        return res.status(500).json({msg:"Sorry data not avilable or Database error",error:err})
    })


})

const viewInactiveUser= asyncHandler(async(req,res)=>{
    
    User.find({status:"inactive"}).
    then((result)=>{
      return res.status(200).json({msg:"We find Inactive data Succesfully",result})
    }).
    catch((err)=>{
      return res.status(500).json({msg:"Sorry data not avilable or Database error",error:err})
    })


})

const authAdmin = asyncHandler(async(req,res)=>{

    const {username,password}= req.body;
    AdminModel.findOne({username}).
    then((user)=>{
        if(!user){
            return res.status(404).json({error :"User Not Found." })
        }
        if(user.password!==password){
            return res.status(404).json({error :"Incorrect Password"})
        }

        const token= jwt.sign(
            {
                role:'admin',
                id:user._id,username:user.username,
            },
            "jwt-secret-key",
            {expiresIn:"1d"}
        )

        res.cookie('Token',token)
        console.log(token)
        res.json({message:"Login Successfull",token:token,name:user.name,_id:user._id})

    })
    .catch((err)=>{
        console.error(err);
        return res.status(500).json({error:"database error", message:"Admin internal server error"})

    })

})
const getAdmin = asyncHandler(async(req,res)=>{
  AdminModel.find({}).
  then((user)=>{
      if(!user){
          return res.status(404).json({error :"User Not Found."})
      }
      res.json({message:"Get Admin Successfull",name:user.name,_id:user._id,user})
  })
  .catch((err)=>{
      console.error(err);
      return res.status(500).json({error:"database error", message:"Admin internal server error"})

  })

})
const logoutAdmin = asyncHandler(async(req,res)=>{
    res.clearCookie('Token');
    return res.json({"msg":"Admin Logout SuccesFully"})
})

const deleteUser =asyncHandler(async(req,res)=>{
    const UserId=req.params.id;

    if(!mongoose.Types.ObjectId.isValid(UserId)){
        return res.status(400).json({error:'Invalid User Id'})
    }
    
    User.findByIdAndDelete(UserId).
    then((result)=>{
        return res.status(200).json({message:"User Successfully Delete"})
    })
    .catch((err)=>{
        return res.status(500).json({message:"User Successfully not Delete",error:err})

    })
})

const chanageStatus =asyncHandler(async(req,res)=>{
    const UserId=req.params.id;
    const {status}=req.body
    if(!mongoose.Types.ObjectId.isValid(UserId)){
        return res.status(400).json({error:'Invalid User Id'})
    }

    User.findByIdAndUpdate(UserId,{status})
    .then((result)=>{
      return res.status(200).json({message:"Status Successfully Update"})
    })
    .catch((err)=>{
      return res.status(500).json({Error:"Sorry !status not Update",err})
    })

})

const groupChat= asyncHandler(async(req,res)=>{
    
    Chat.find({isGroupChat:true}).
    populate("users","name").
    then((result)=>{
     return res.status(200).json({msg:"We find GroupChat SuccessFull",result})
    })
    .catch((error)=>{
    return res.status(200).json({msg:"We not find SuccessFull chat",error})
    })

})

const deleteGropChat =asyncHandler(async(req,res)=>{
    const GroupId=req.params.id;

    if(!mongoose.Types.ObjectId.isValid(GroupId)){
        return res.status(400).json({error:'Invalid Group Id'})
    }
    
    Chat.findByIdAndDelete(GroupId).
    then((result)=>{
        return res.status(200).json({message:"Group Successfully Delete"})
    })
    .catch((err)=>{
        return res.status(500).json({message:"Group Successfully not Delete",error:err})

    })
})
const deleteFeedback =asyncHandler(async(req,res)=>{
    const FeedbackId=req.params.id;

    if(!mongoose.Types.ObjectId.isValid(FeedbackId)){
        return res.status(400).json({error:'Invalid Group Id'})
    }
    
    FeedBackModel.findByIdAndDelete(FeedbackId).
    then((result)=>{
        return res.status(200).json({message:"Feedback Successfully Delete"})
    })
    .catch((err)=>{
        return res.status(500).json({message:"Feedback Successfully not Delete",error:err})

    })
})

const createFeedback=asyncHandler(async(req,res)=>{
      
    const {name,email,discription} = req.body

    FeedBackModel.create({name,email,discription}).
    then((result)=>{
        return res.status(200).json({message:"feedback Successfully Created",result})

    })
    .catch((error)=>{
        return res.status(500).json({message:"feedback not Successfully Created",error})  
    })

})
const getFeedback=asyncHandler(async(req,res)=>{
    FeedBackModel.find().
    then((result)=>{
        return res.status(200).json({message:"feedback Successfully Created",result})

    })
    .catch((error)=>{
        return res.status(500).json({message:"feedback not Successfully Created",error})  
    })

})

const getUsers = asyncHandler(async(req,res)=>{

    const keyword = req.query.search ? {
      $or:[
        {name:{$regex : req.query.search,$options:"i"}},
        {email:{$regex : req.query.search,$options:"i"}},
      ],
    } :{} ;
    
    const users = await User.find(keyword).find();
    res.json(users);
  });

const craeteAndAxcess = asyncHandler(async(req,res)=>{
    const {userId,adminId}=req.body;

    if(!mongoose.Types.ObjectId.isValid(adminId)){
        return res.status(400).json({error:'Invalid admin Id'});
    }

    if(!mongoose.Types.ObjectId.isValid(userId)){
      return res.status(400).json({error:'Invalid User Id'});
  }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
          { users2: { $elemMatch: { $eq: adminId } } },
          { users2: { $elemMatch: { $eq: userId } } },
        ],
      })
        .populate("users2", "-password")

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
          users2: [adminId, userId],
        };
    
       
        try {
          const createdChat = await Chat.create(chatData);
          const FullChat = await Chat.findOne({ _id: createdChat._id }).
          populate("users2","-password")
    
          res.status(200).json(FullChat);
        } catch (error) {
          res.status(400);
          throw new Error(error.message);
        }
      }
    

})

const craeteAndAxcess2 = asyncHandler(async(req,res)=>{
  const {userId,adminId}=req.body;

  if(!mongoose.Types.ObjectId.isValid(adminId)){
      return res.status(400).json({error:'Invalid admin Id'});
   }

  if(!mongoose.Types.ObjectId.isValid(userId)){
    return res.status(400).json({error:'Invalid User Id'});
   }

  var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users2: { $elemMatch: { $eq: userId } } },
        { users2: { $elemMatch: { $eq: adminId } } },
      ],
    })
      .populate("users", "-password")
    

     
  
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
        users2: [ userId, adminId],
      };
  
     
      try {
        const createdChat = await Chat.create(chatData);
        const FullChat = await Chat.findOne({ _id: createdChat._id }).
        populate("users2","-password")
  
        res.status(200).json(FullChat);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
  

})


const sendMessageAdmin = asyncHandler(async (req, res) => {
  try {
    const { content, chatId ,adminId} = req.body;

    if (!content || !chatId || !adminId) {
      console.log("Invalid data passed into request");
      return res.status(400).json({error: "Invalid data passed into request"});
    }

    const newMessage = {
      sender2: adminId,
      content: content,
      chat: chatId,
    };

    // Create a new message
    var  message = await Message.create(newMessage);

    // Populate necessary fields
    message = await message.populate("sender2", "_id");
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



const allMessagesAdmin= asyncHandler(async(req,res)=>{
  try {
   console.log(req.params.id)
   const message= await Message.find({chat:req.params.id})
   .populate("sender2","name pic email")
   .populate("chat")
   if(!message){
   return  res.json({res:"Sorry message not available"})
   }
   res.json(message)
  } catch (error) {
   res.status(400);
   throw new Error(error.massage);
  }
});

const changePassword = asyncHandler(async(req, res) => {
  const userId = req.body.id;
  console.log("userId", userId)
  const { currentPassword, password } = req.body;


  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid admin ID.' });
  }


  AdminModel.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      // Compare the provided current password with the stored password
      if (currentPassword != user.password) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      // Update the user's password with the new password
      user.password = password;
      user.save()
        .then(() => {
          // Password changed successfully
          res.status(200).json({ message: 'Password changed successfully' });
        })
        .catch((saveErr) => {
          console.error(saveErr);
          res.status(500).json({ error: 'User update failed.' });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Password change failed.' });
    });
  }

);

module.exports = {changePassword,getAdmin,craeteAndAxcess2,allMessagesAdmin,sendMessageAdmin,craeteAndAxcess,getUsers,deleteFeedback,getFeedback,
    createFeedback,authAdmin , logoutAdmin , viewActiveUser,viewInactiveUser 
    ,deleteUser,chanageStatus,groupChat,deleteGropChat };