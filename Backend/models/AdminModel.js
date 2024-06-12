const mongoose = require('mongoose')

const adminSchema =mongoose.Schema({
    name:{type :String},
    username:{type:String,required:true},
    password:{type:String, required:true},
})

const AdminModel=mongoose.model("Admin",adminSchema)
module.exports=AdminModel