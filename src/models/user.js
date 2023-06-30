const mongoose = require('mongoose');

const logInSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
    
})

const LogInData=new mongoose.model('LogInData',logInSchema)

module.exports=LogInData