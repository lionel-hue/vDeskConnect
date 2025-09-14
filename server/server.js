import express from "express"
import cors from "cors"
import signup_router from "./routes/auth/signup.js"
import login_router from "./routes/auth/login.js"


const PORT = process.env.VITE_PORT || 8080

const app = express()

// Explicit CORS config for frontend
app.use(cors({
  origin: "http://localhost:5173", // Update if your frontend runs elsewhere
  credentials: true
}))

app.use(express.json())


// --auth
app.use("/auth/", signup_router )
app.use("/auth/", login_router )

app.listen(PORT, ()=> { console.log(`server started on port ${PORT}!`)})