const jwt=require("jsonwebtoken");
const User=require("../models/userModel");

const asyncHandler=require("express-async-handler");

const protect = asyncHandler(async(req, res,next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded Token:", decoded); // Log the decoded token
            req.user = await User.findById(decoded.id).select("-password");
            console.log("User from DB:", req.user._id); // Log the user fetched from the database
            next();
        } catch (error) {
            console.error("JWT Verification Error:", error);
            res.status(401);
            throw new Error("Not authorized, token failed");
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized,No Token");
    }
});

 

module.exports={protect}