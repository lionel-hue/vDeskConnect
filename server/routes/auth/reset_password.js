import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import general from "../../models/General.js";
import student from "../../models/Student.js";
import { Router } from "express";

const reset_password = Router()

reset_password.post("/reset-password", async (req, res) => {

    try{
        //First verify token that was sent wasn't tampared with...
        const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)

        //if the decoded token was from a student...
        if( decoded.type === "student" ){

            console.log(decoded)
            if( (await general.auth.token.get_token(decoded.id) ).rows[0] !== undefined  ){

                await general.auth.token.use_token( decoded.id, new Date( Date.now() ) ) 

                passwordHash = bcrypt.hash(req.body.newPassword, 10)
                await student.auth.changePassword(passwordHash, decoded.id)

                return res.status(200).json({
                    "success" : true,
                    "message" : "password successfullly reset !"    
                })
            }


        }

    }catch(error){
        console.log("error")
        
        res.status(500).json({
            "success" : false,
            "message" : "an unexpected error occured !"
        })
    }
})

export default reset_password