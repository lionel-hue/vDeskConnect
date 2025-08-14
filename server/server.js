import express from "express"
import cors from "cors"
import router from "./routes/auth/Student.js"


const PORT = process.env.PORT || 8080

const app = express()

app.use( cors() )
app.use( express.json() )

//Student Routes
// --auth
app.use("/auth/student/", router )

app.listen(PORT, ()=> { console.log(`server started on port ${PORT}!`)})