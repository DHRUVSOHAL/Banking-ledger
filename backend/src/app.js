const express=require('express')
const cookieParser=require('cookie-parser')
const authRouter=require('./routes/auth.routes.js')
const accountRouter=require('./routes/account.routes.js')
const transectionRouter=require('./routes/transection.routes.js')
const app=express()

app.use(express.json())//body ke ander ka data read kr sake
app.use(cookieParser())//cookie read krne ke liye

app.use("/api/auth",authRouter)
app.use("/api/accounts",accountRouter)
app.use("/api/transections",transectionRouter)
module.exports=app