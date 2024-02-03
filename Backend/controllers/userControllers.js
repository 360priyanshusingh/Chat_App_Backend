const asyncHandler = require('express-async-handler');
const express = require('express');
const User = require('../models/userModel');
const generateToken=require('../config/generateToken')
// const app = express();

// const registerUser = asyncHandler(async(req,res) => {
//     // res.send("This is the API running  third  time successfully");
//     console.log(`this the registerUser page`)
//  try {
//      // Remove unnecessary `next()` call
//   // next();
//   const { name, email, password, pic } = req.body; // Use destructuring to extract values

//   if (!name || !password || !email) {
//     res.status(400);
//     throw new Error("Please enter all fields"); // Fix typo in the error message
//   }
//   console.log('Before creating user');

//   const userExists = await User.findOne({ email }); // Fix typo in the method name

//   if (userExists) {
//     res.status(400);
//     throw new Error("User already exists"); // Fix typo in the error message
//   }

//   const user = await User.create({
//     email,
//     name,
//     password,
//     pic,
//     // Remove unnecessary _id, MongoDB will generate it automatically
//   });

//   console.log('After creating user');

 
//   if (user) {
//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       pic: user.pic,
//       token:generateToken(user._id),
//     });
//   } else {
//     res.status(400);
//     throw new Error("Failed to create user");
//   }
//  } catch (error) {
//     console.error('Error in registerUser:', error);
//     res.status(500).send('Internal Server Error');
//  }
// });

const registerUser = asyncHandler(async (req, res) => {
  console.log('This is the registerUser page');
  try {
    const { name, email, password, pic } = req.body;

    if (!name || !password || !email) {
      res.status(400).json({ error: "Please enter all fields" });
      return;
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const user = await User.create({
      email,
      name,
      password,
      pic,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ error: "Failed to create user" });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

module.exports = registerUser;


const authUser=asyncHandler(async(req,res)=>{
 
  const {email,password}= req.body;
  const user = await User.findOne({ email });

  if(user && (await user.matchPassword(password))){
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token:generateToken(user._id),
    });

   }
  else{
    res.status(401);
    throw new Error("Invalid Email or Password")
  }
});

const allUsers = asyncHandler(async(req,res,next)=>{
  const keyword = req.query.search ? {
    $or:[
      {name:{$regex : req.query.search,$options:"i"}},
      {email:{$regex : req.query.search,$options:"i"}},
    ],
  } :{} ;
  
  if (!req.user || !req.user._id) {
    return res.status(401).json({ error: 'User not authenticated or missing user ID' });
}
  const users = await User.find(keyword).find({ _id:{ $ne: req.user._id } });
  res.json(users);
});

module.exports = { registerUser ,authUser, allUsers};
