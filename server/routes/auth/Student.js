import { Router } from "express"
import student from "../../models/Student.js"
import generator from "../../utils/id_generator.js"

const router = Router()

router.post("/signup/", async (req,res)=> {
    console.log(req.body)
    let response = await student.auth.add_new(generator(), req.body.name)
    res.json(
        {
            "status" : "success",
        })
})

export default router