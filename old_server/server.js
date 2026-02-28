import express from "express"
import cors from "cors"
import signup_router from "./routes/auth/signup.js"
import login_router from "./routes/auth/login.js"
import forgot_password from "./routes/auth/forgot_password.js"
import reset_password from "./routes/auth/reset_password.js"
import invite_manager_router from "./routes/home/invite_manager.js"


const PORT = process.env.PORT || 8080

const app = express()

// Explicit CORS config for frontend
app.use(cors({
  origin: [`${process.env.HOST}`,
    `${process.env.FRONT}`, 
    'http://127.0.0.1:5173',
    'http://172.18.0.1:5173/'],
  credentials: true
})) 

app.use(express.json())


// --auth
app.use("/auth/", signup_router )
app.use("/auth/", login_router )
app.use("/auth/", forgot_password )
app.use("/auth/", reset_password )

// --home
// --invite manager
app.use("/home/invite_manager/", invite_manager_router)


app.listen(PORT, ()=> { console.log(`server started on port ${PORT}!`)})