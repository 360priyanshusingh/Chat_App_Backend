// config/db.js

const mongoose = require('mongoose');
const dotenv=require("dotenv");
dotenv.config();


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected to: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error Message: ${error.message}`);
    process.exit(1); // Exit the process with an error code
  }
};

module.exports = connectDB;
