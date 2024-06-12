const mongoose=require('mongoose')

const FeedBackSchema=mongoose.Schema({
    name:{type:String},
    email:{type:String},
    discription:{type:String}
})

const FeedBackModel=mongoose.model('feedback',FeedBackSchema)

module.exports =FeedBackModel