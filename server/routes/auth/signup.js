import { Router } from "express"
import student from "../../models/Student.js"
import generator from "../../utils/id_generator.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


const signup_router = Router()

signup_router.post("/signup/student/", async (req, res) => {

    const id = generator()  
    const hashed_password = await bcrypt.hash(req.body.password, 10)

    const grade_num = req.body.grade === "jss1" ? 1 :
        req.body.grade === "jss2" ? 2 :
            req.body.grade === "jss3" ? 3 :
                req.body.grade === "sss1" ? 4 :
                    req.body.grade === "sss2" ? 5 :
                        req.body.grade === "sss3" ? 6 : null


    const dep_code = req.body.department === "Science" ?
        "SCI" : req.body.department === "Commercial" ?
            "COM" : req.body.department === "ART" ?
                "ART" : null

    await student.auth.add_new(
        id,
        req.body.name,
        req.body.email,
        hashed_password,
        req.body.dateOfBirth,
        req.body.stateOfOrigin,
        req.body.sex,
        req.body.previousAddress,
        req.body.currentAddress,
        req.body.bloodGroup,
        req.body.genotype,
        req.body.height,
        req.body.weight,
        req.body.disability,
        req.body.parentGuardianType,
        req.body.parentGuardianPhone,
        req.body.parentGuardianEmail,
        req.body.parentGuardianAddress
    )

    await (req.body.studentType === "junior" ?
        student.auth.junior.add_new(id, grade_num) :
        student.auth.senior.add_new(id, req.body.role, dep_code, grade_num)
    )
        
    res.status(201).json({ 
        message: "Student registered successfully",
        studentId: id 
    })
})

export default signup_router