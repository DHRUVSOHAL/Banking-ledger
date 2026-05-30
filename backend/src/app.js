const express=require('express')
const cookieParser=require('cookie-parser')
const authRouter=require('./routes/auth.routes.js')

const app=express()

app.use(express.json())//body ke ander ka data read kr sake
app.use(cookieParser())//cookie read krne ke liye
app.use("/api/auth",authRouter)

module.exports=app