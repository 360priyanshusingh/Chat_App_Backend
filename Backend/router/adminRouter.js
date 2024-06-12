const express = require('express');
const  {changePassword,getAdmin,craeteAndAxcess2,allMessagesAdmin,authAdmin,createFeedback,logoutAdmin,viewActiveUser,viewInactiveUser,deleteUser,chanageStatus,groupChat
,deleteGropChat,getFeedback, deleteFeedback, getUsers , craeteAndAxcess,sendMessageAdmin } = require('../controllers/adminControllers');


const {protect} =require("../middleware/authMiddleware")
const router = express.Router();


// router.route("/").get(protect,allUsers);  
router.route("/logout").get(logoutAdmin);
router.route("/viewActiveUser").get(viewActiveUser);
router.route("/viewInactiveUser").get(viewInactiveUser);
router.route("/groupChat").get(groupChat);
router.route("/deleteUser/:id").delete(deleteUser);
router.route("/chanageStatus/:id").post(chanageStatus);
router.route("/allMessagesAdmin/:id").get(allMessagesAdmin);
router.route("/createFeedback").post(createFeedback);
router.route("/deleteGropChat/:id").delete(deleteGropChat);
router.route("/deleteFeedback/:id").delete(deleteFeedback);
router.post("/login", authAdmin);
router.route("/getFeedback").get( getFeedback);
router.route("/getUsers").get(getUsers);  
router.route("/getAdmin").get(getAdmin);  
router.route("/sendMessageAdmin").post(sendMessageAdmin);  
router.route("/craeteAndAxcess").post(craeteAndAxcess);  
router.route("/craeteAndAxcess2").post(craeteAndAxcess2);  
router.route("/changePassword").put(changePassword);  


module.exports = router;