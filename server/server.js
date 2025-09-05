import express from "express"
import cors from "cors"
import signup_router from "./routes/auth/signup.js"
import login_router from "./routes/auth/login.js"


const PORT = process.env.PORT || 8080

const app = express()

app.use( cors() )
app.use( express.json() )


// --auth
app.use("/auth/", signup_router )
app.use("/auth/", login_router )

app.listen(PORT, ()=> { console.log(`server started on port ${PORT}!`)})