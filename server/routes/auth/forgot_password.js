import student from "../../models/Student.js"
import teacher from "../../models/Teacher.js"
import general from "../../models/General.js"
import { Router } from "express"
import bcrypt from "bcryptjs"
import send_mail from "../../utils/mailer.js"
import jwt from "jsonwebtoken"
import generator from "../../utils/id_generator.js"

const forgot_password = Router()

forgot_password.post("/forgot-password", async (req, res) => {

    try {
        // get all emails of students and teachers 
        const students = (await student.auth.getAllEmails()).rows
        const teachers = (await teacher.auth.getAllEmails()).rows

        // define the empty user id and type.. and token 
        const user = {
            id: null,
            type: undefined
        }

        let tokenHash

        try {
            //check where the email belongs... to the table Student or Teacher
            // not found ? email doesn't exist.. found ??? success !
            if (students.find(elem => elem === req.body.email) != '') {

                user.id = (await student.auth.getByEmail(req.body.email)).rows[0].Stu_id
                user.type = "student"

                // generate database token for the user..
                tokenHash = await bcrypt.hash(generator.id(), 10)
                await general.auth.token.build_token(generator.id(), tokenHash, "student", new Date(Date.now() + 10 * 60 * 1000), user.id)

            } else if (teachers.find((elem => elem === req.body.email)) != '') {

                user.id = (await teacher.auth.getByEmail(email)).rows[0].T_id
                user.type = "teacher"

                // generate database token for the user..
                tokenHash = await bcrypt.hash(generator.id(), 10)
                await general.auth.token.build_token(generator.id(), tokenHash, "teacher", new Date(Date.now() + 10 * 60 * 1000), user.id)

            }

        } catch (error) {
            console.log("An unexpected error occured : ", error.message)

            return res.status(400).json({
                "success": false,
                "message": "Email doesn't exists"
            })
        }

        //jwt token generator
        const jwt_token =
            jwt.sign(
                user,
                process.env.JWT_SECRET,
                { expiresIn: '10m' }
            )

        const passwordRestLink = `${process.env.VITE_FRONT}/reset-password?token=${jwt_token}`

        send_mail.forgot_password(req.body.email, passwordRestLink)

        res.status(200).json({
            success: true,
            message: "successfully sent password reset link"
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            "success": false,
            "messsge": "An unexpected problem occured"
        })
    }

})

export default forgot_password