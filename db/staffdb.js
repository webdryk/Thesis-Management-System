const mongoose= require('mongoose')

const staffSchema= new mongoose.Schema({

    fName:{
        type:String
    },
    lName:{
        type:String
    },
    ID:{
        type:String
    },
    email:{
        type:String
    },
    department:{
        type:String
    },
    role:{
        type:String
    },
    password:{
        type:String
    },
    panelist:{
        type:String
    }


})

module.exports=mongoose.model('staff',staffSchema)