import student from "../../models/Student.js";
import teacher from "../../models/Teacher.js";
import { Router } from "express";
import bcrypt from "bcryptjs";
import send_mail from "../../utils/mailer.js";
import jwt from "jsonwebtoken"

const forgot_password = Router()

forgot_password.post("/forgot-password", async (req, res) => {

    // get all emails of students and teachers 
    const students = (await student.auth.getAllEmails()).rows
    const teachers = (await teacher.auth.getAllEmails()).rows

    // define the empty user email and type..
    const user = {
        email: null,
        type: undefined
    }

    //check where the email belongs... to the table Student or Teacher
    // not found ? email doesn't exist.. found ??? success !
    if (students.find(elem => elem === req.body.email) != '') {
        user.email = req.body.email
        user.type = "student"

    } else if (teachers.find((elem => elem === req.body.email)) != '') {
        user.email = req.body.email
        user.type = "teacher"

    } else {
        return res.status(400).json({
            "success": false,
            "message": "Email doesn't exists"
        })
    }

    //jwt token generator
    const token = 
    jwt.sign(
        user,
        process.env.JWT_SECRET,
        { expiresIn : '1h' }
    )

    send_mail.forgot_password(req.body.email)
})

export default forgot_password