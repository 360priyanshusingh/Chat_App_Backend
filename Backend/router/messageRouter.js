const express= require("express")

const  { protect}= require("../middleware/authMiddleware")
const {sendMessage,allMessages} =require("../controllers/messageControlles")
const router= express.Router();

router.route('/').post(protect,sendMessage)
router.route('/:chatId').get(protect,allMessages)
// router.post('/', (req, res) => {
//     res.send('This is the message route.');
//     console.log(`"Message router chal rha h "`)
//     sendMessage();
//   });

module.exports=router;