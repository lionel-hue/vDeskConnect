import { Router } from "express";
import student from "../../models/Student.js";
import teacher from "../../models/Teacher.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const login_router = Router();

login_router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;


        // Validate required fields
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Email, password, and role are required",
            });
        }

        let user = null;
        let userRole = role;
        let userIdField = "";

        // Handle different user roles
        switch (role) {
            case "junior-student":
            case "senior-student":
                // For students
                const studentResult = await student.auth.getByEmail(email);
                if (!studentResult.rows || studentResult.rows.length === 0) {
                    return res.status(401).json({ // Changed to 401 for security
                        success: false,
                        message: "Invalid credentials",
                    });
                }
                user = studentResult.rows[0];
                userIdField = "Stu_id";
                break;

            case "teacher":
            case "admin":
                // For teachers and admins
                const teacherResult = await teacher.auth.getByEmail(email);
                if (!teacherResult.rows || teacherResult.rows.length === 0) {
                    return res.status(401).json({ // Changed to 401 for security
                        success: false,
                        message: "Invalid credentials",
                    });
                }
                user = teacherResult.rows[0];
                userIdField = "T_id";

                // Check if user is actually an admin (but don't reveal this info yet)
                if (role === "admin") {
                    const adminResult = await teacher.auth.getById(user.T_id);
                    if (!adminResult.rows || adminResult.rows.length === 0) {
                        // Don't reveal admin status until after password verification
                        userRole = "teacher"; // Temporarily set to teacher
                    } else {
                        userRole = "admin";
                    }
                } else {
                    userRole = "teacher";
                }
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid role specified",
                });
        }

        // Compare password FIRST (before checking verification)
        const isMatch = await bcrypt.compare(password, user.password);

        // console.log(password)
        // console.log(user.password)
        // console.log(isMatch)
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // NOW check verification (only after password is correct)
        if (!user.verified) {
            return res.status(403).json({
                success: false,
                message: "User is not verified. Please verify your account.",
            });
        }

        // For admin role, re-check admin status now that we know credentials are correct
        if (role === "admin") {
            const adminResult = await teacher.admin.getById(user.T_id);
            if (!adminResult.rows || adminResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "User is not an admin",
                });
            }
            userRole = "admin";
        }

        // Generate JWT
        const payload = {
            id: user[userIdField],
            email: user.email,
            role: userRole,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Prepare response data
        let responseData = {
            id: user[userIdField],
            email: user.email,
            role: userRole,
            verified: user.verified,
            token,
        };

        // Add role-specific data
        if (userRole === "junior-student" || userRole === "senior-student") {
            responseData = {
                ...responseData,
                name: user.Stu_name,
                dateOfBirth: user.dateofbirth,
                stateOfOrigin: user.stateoforigin,
                sex: user.sex,
                currentAddress: user.current_address,
                bloodGroup: user.blood_group,
                genotype: user.genotype,
                parentGuardianPhone: user.parent_guardian_phone,
            };
        } else if (userRole === "teacher" || userRole === "admin") {
            responseData = {
                ...responseData,
                name: user.T_name,
                dateOfBirth: user.date_of_birth,
                stateOfOrigin: user.state_of_origin,
                sex: user.sex,
                currentAddress: user.current_address,
                bloodGroup: user.bloodgroup,
                genotype: user.genotype,
                qualification: user.qualification,
                tel: user.tel,
            };
        }

        // Send success response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: responseData,
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

export default login_router;