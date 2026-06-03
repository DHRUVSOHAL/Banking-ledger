const mongoose=require("mongoose")

const tokenBlackListSchema=new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    }
    
},
{
    timestamps: true
})

tokenBlackListSchema.index({createdAt:1},{
    expireAfterSeconds:60*60*24//blacklisted tokens will be automatically removed after 24 hours
})

const tokenBlackListModel=mongoose.model("tokenBlackList",tokenBlackListSchema)
module.exports=tokenBlackListModel