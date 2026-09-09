const express = require('express')
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth.routes.js')
const accountRouter = require('./routes/account.routes.js')
const transectionRouter = require('./routes/transection.routes.js')
const depositRequestRouter = require('./routes/depositRequest.routes.js')
const app = express()

// Allowed origins: Localhost + Deployed Frontend
const allowedOrigins = [
  'http://localhost:5173',
  'https://banking-ledger-frontend.onrender.com', // 👈 Tumhara deployed frontend link
  process.env.FRONTEND_URL
]

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || allowedOrigins[0])
  }
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS') // 👈 PATCH add kar diya
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.use(express.json()) // body ke andar ka data read karne ke liye
app.use(cookieParser()) // cookie read karne ke liye

app.use("/api/auth", authRouter)
app.use("/api/accounts", accountRouter)
app.use("/api/transactions", transectionRouter)

// Dhyaan rahe: Agar frontend service me '/deposit-requests' hai to yahan bhi wahi hona chahiye
// Agar frontend me '/deposits' kar diya hai to '/api/deposits' perfectly chalega:
app.use("/api/deposits", depositRequestRouter)

module.exports = app