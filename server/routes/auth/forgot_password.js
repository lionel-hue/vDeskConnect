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
        const { email, userType } = req.body;

        // Validate input
        if (!email || !userType) {
            return res.status(400).json({
                "success": false,
                "message": "Email and user type are required"
            });
        }

        // Define the empty user id and type
        const user = {
            id: null,
            type: undefined
        }

        let tokenHash;

        try {
            // Check the user type and search in the appropriate table
            switch (userType) {
                case 'student':
                    // Check if email exists in student table
                    const studentResult = await student.auth.getByEmail(email);
                    if (studentResult.rows.length === 0) {
                        return res.status(400).json({
                            "success": false,
                            "message": "Student email not found"
                        });
                    }
                    user.id = studentResult.rows[0].Stu_id;
                    user.type = "student";
                    
                    // Generate database token for the user
                    tokenHash = await bcrypt.hash(generator.id(), 10);
                    await general.auth.token.build_token(
                        generator.id(), 
                        tokenHash, 
                        "student", 
                        new Date(Date.now() + 10 * 60 * 1000), 
                        user.id
                    );
                    break;

                case 'teacher':
                    // Check if email exists in teacher table
                    const teacherResult = await teacher.auth.getByEmail(email);
                    if (teacherResult.rows.length === 0) {
                        return res.status(400).json({
                            "success": false,
                            "message": "Teacher email not found"
                        });
                    }
                    user.id = teacherResult.rows[0].T_id;
                    user.type = "teacher";
                    
                    // Generate database token for the user
                    tokenHash = await bcrypt.hash(generator.id(), 10);
                    await general.auth.token.build_token(
                        generator.id(), 
                        tokenHash, 
                        "teacher", 
                        new Date(Date.now() + 10 * 60 * 1000), 
                        user.id
                    );
                    break;

                case 'admin':
                    // Check if email exists in admin table (through teacher table)
                    const adminResult = await teacher.auth.getByEmail(email);
                    // console.log(adminResult.rows)
                    if ( adminResult.rows.length === 0) {
                        return res.status(400).json({
                            "success": false,
                            "message": "Administrator email not found"
                        });
                    }
                    
                    // Verify that this teacher is also an admin
                    // console.log( adminResult.rows[0].T_id )
                    const adminCheck = await teacher.admin.getById( adminResult.rows[0].T_id )
                    if ( adminCheck.rows.lenght === 0 ) {
                        return res.status(400).json({
                            "success": false,
                            "message": "Administrator email not found"
                        });
                    }
                    
                    user.id = adminResult.rows[0].T_id;
                    user.type = "admin";
                    
                    // Generate database token for the user
                    tokenHash = await bcrypt.hash(generator.id(), 10);
                    await general.auth.token.build_token(
                        generator.id(), 
                        tokenHash, 
                        "admin", 
                        new Date(Date.now() + 10 * 60 * 1000), 
                        user.id
                    );
                    break;

                default:
                    return res.status(400).json({
                        "success": false,
                        "message": "Invalid user type"
                    });
            }

        } catch (error) {
            console.log("An unexpected error occurred:", error.message);
            return res.status(400).json({
                "success": false,
                "message": "Email doesn't exist for the selected user type"
            });
        }

        // JWT token generator
        const jwt_token = jwt.sign(
            user,
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        const passwordResetLink = `${process.env.FRONT}/reset-password?token=${jwt_token}`;

        // Send email
        await send_mail.forgot_password(email, passwordResetLink);

        res.status(200).json({
            success: true,
            message: "Password reset link sent successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            "success": false,
            "message": "An unexpected problem occurred"
        });
    }
});

export default forgot_password;