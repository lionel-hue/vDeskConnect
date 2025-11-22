import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import token from "../../models/Token.js";
import student from "../../models/Student.js";
import teacher from "../../models/Teacher.js"
import { Router } from "express";

const reset_password = Router()

reset_password.post("/reset-password", async (req, res) => {

    try {
        //First verify token that was sent wasn't tampared with...
        const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)
        let passwordHash = undefined

        //If the token hash we stored in the database exists for this user then we use the token
        //by setting it's used attribute in the token table to "true"
        if ((await token.auth.get_token(decoded.id)).rows[0] !== undefined) {

            //use the token.. never to be used again...
            await token.auth.use_token(decoded.id, new Date(Date.now()))

            //if the decoded token was from a student...
            if (decoded.type === "student") {

                //ok, let's finally reset the user password for them !
                passwordHash = await bcrypt.hash(req.body.newPassword, 10)
                await student.auth.changePassword(decoded.id, passwordHash)

                //else if the decoded token was from a teacher or admin !    
            } else if (decoded.type === "teacher" || decoded.type === "admin") {

                //ok, let's finally reset the user password for them !
                passwordHash = await bcrypt.hash(req.body.newPassword, 10)
                await teacher.auth.changePassword(decoded.id, passwordHash)
            }

            console.log("decoded.id : " + decoded.id)
            console.log("decoded.type : " + decoded.type)
            console.log("decoded : " + JSON.stringify(decoded) )
            console.log("depuis reset_password.js, le hash du mot de passe : " + passwordHash)
            console.log("depuis reset_password.js, le mot de passe : " + req.body.newPassword)
            //return success !
            return res.status(200).json({
                "success": true,
                "message": "password successfullly reset !"
            })

        } else {
            return res.status(400).json({
                "success": false,
                "message": "Your session has expired !"
            })
        }

    } catch (error) {
        console.log("Error in reset password :", error.message)

        // More specific error handling
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({
                "success": false,
                "message": "Invalid token!"
            })
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                "success": false,
                "message": "Token has expired!"
            })
        }

        res.status(500).json({
            "success": false,
            "message": "an unexpected error occured !"
        })
    }
})

export default reset_password