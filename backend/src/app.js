const express=require('express')
const cookieParser=require('cookie-parser')
const authRouter=require('./routes/auth.routes.js')
const accountRouter=require('./routes/account.routes.js')
const transectionRouter=require('./routes/transection.routes.js')
const depositRequestRouter = require('./routes/depositRequest.routes.js')
const app=express()

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5173')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
})

app.use(express.json())//body ke ander ka data read kr sake
app.use(cookieParser())//cookie read krne ke liye

app.use("/api/auth",authRouter)
app.use("/api/accounts",accountRouter)
app.use("/api/transections",transectionRouter)

app.use("/api/deposits", depositRequestRouter)
module.exports=app