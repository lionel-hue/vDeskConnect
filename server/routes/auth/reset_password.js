import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import general from "../../models/General.js";
import { Router } from "express";

const reset_password = Router()

reset_password.post("/reset-password", async (req, res) => {
    console.log("hello")
})

export default reset_password