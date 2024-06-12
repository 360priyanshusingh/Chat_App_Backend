// userRouter.js
const express = require('express');
const  {registerUser,authUser, allUsers } = require('../controllers/userControllers');
const {protect} =require("../middleware/authMiddleware")
const router = express.Router();
const path =require("path")
const multer = require('multer');
// const User = require('../models/userModel');
// const generateToken = require('../config/generateToken');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'backend/public/images')
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
})

const upload = multer({
  storage: storage
})

router.route("/").get(protect,allUsers);  
router.route("/").post(upload.single("pic"),registerUser);
router.post("/login", authUser);


module.exports = router;
