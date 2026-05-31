const mongoose = require('mongoose');


const transectionSchema=new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
     toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
     },
     status:{
        type:String,
        enum:{
            values:["Pending","Completed","Failed"]
        },
        default:"Pending"
     },
     amount:{
        type:Number,
        required:[true,"Amount is requires for transection"]
     },
     idempotencyKey:{
        type:String,
        required:[true,"Idempotency key is required for transection"],
        index:true,
        unique:true
     }

    
},
{
    timeStamps:true
})


const transectionModel=mongoose.model("transection",transectionSchema)

module.exports=transectionModel