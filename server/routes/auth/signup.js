import { Router } from "express"
import student from "../../models/Student.js"
import generator from "../../utils/id_generator.js"

const signup_router = Router()

signup_router.post("/signup/student/", async (req, res) => {

    id = generator()

    grade_num = req.body.grade == "jss1" ? 1 :
        req.body.grade == "jss2" ? 2 :
            req.body.grade == "jss3" ? 3 :
                req.body.grade == "sss1" ? 4 :
                    req.body.grade == "sss2" ? 5 :
                        req.body.grade == "sss3" ? 6 : null


    dep_code = req.body.department === "Science" ?
        "SCI" : req.body.department === "Commercial" ?
            "COM" : req.body.department === "ART" ?
                "ART" : null

    console.log("request: " + req.body + "\nid: " + id)
    student.auth.add_new(id, req.body.name)

        (req.body.studentType === "junior") ?
        (student.auth.junior.add_new(id, req.body.grade_num)) :
        (student.auth.senior.add_new(id, req.body.role, dep_code, grade_num))

    res.json(
        {
            "status": "success",
        })
})

export default signup_router