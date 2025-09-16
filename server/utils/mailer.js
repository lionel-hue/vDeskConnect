import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})

const send_mail = {

    async verification_code(code, email) {
        try {
            const mailOptions = {
                from: process.env.MAIL_USER,
                to: email,
                subject: 'Your vDeskConnect Verification Code',
                html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Verify Your vDeskConnect Account</h2>
          <p>Thank you for signing up for vDeskConnect. Your verification code is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4F46E5; margin: 0; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes. If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">vDeskConnect Team</p>
        </div>`
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
            return result;

        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    },

    async forgot_password(email) {
        try {
            const mailOptions = {
                from: process.env.MAIL_USER,
                to: email,
                subject: 'Your vDeskConnect Password Reset',
                html:
                    `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - vDeskconnect</title>
    <style>
        /* General Styles & Utilities */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            line-height: 1.5;
            padding: 1rem;
            display: flex; /* Centers the content vertically and horizontally */
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .container {
            max-width: 28rem;
            width: 100%;
        }

        /* Card Component */
        .card {
            background-color: #1e293b;
            border: 1px solid #374151;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .card-header {
            padding: 1.5rem;
            text-align: center;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
        }

        .logo {
            width: 4rem;
            height: 4rem;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-weight: bold;
            font-size: 1.25rem;
            color: white;
            backdrop-filter: blur(10px);
        }

        .card-title {
            font-size: 1.5rem;
            font-weight: bold;
            color: #f8fafc;
            margin-bottom: 0.5rem;
        }

        .card-description {
            color: #e2e8f0;
            font-size: 0.875rem;
        }

        .card-content {
            padding: 1.5rem;
        }

        /* Form Layout */
        .form {
            display: flex;
            flex-direction: column;
            gap: 1rem; /* Creates the space between the fields */
        }

        /*
        To fix the password fields from appearing side-by-side,
        we need to give them a container that forces a vertical layout.
        The 'form-group' class is already designed for this.
        */
        .form-row {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .label {
            color: #e2e8f0;
            font-size: 0.875rem;
            font-weight: 500;
        }

        .input {
            background-color: #374151;
            border: 1px solid #4b5563;
            border-radius: 0.375rem;
            padding: 0.625rem 0.75rem;
            color: #f8fafc;
            font-size: 0.875rem;
            transition: border-color 0.2s, box-shadow 0.2s;
            width: 100%;
        }

        .input:focus {
            outline: none;
            border-color: #8b5cf6;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .input.error {
            border-color: #ef4444;
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            border: none;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
            text-decoration: none;
            color: white;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            width: 100%; /* Make the button full-width */
        }

        .btn:hover {
            background: linear-gradient(135deg, #7c3aed, #2563eb);
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Message Styling */
        .error-message {
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            padding: 0.5rem;
            background-color: #fef2f2;
            border-radius: 0.375rem;
            border-left: 3px solid #dc2626;
            display: none;
        }

        .success-message {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem;
            background-color: #065f46;
            border: 1px solid #059669;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            color: #d1fae5;
            display: none;
        }

        .loading-spinner {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            border: 2px solid #f3f4f6;
            border-top: 2px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 0.5rem;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Footer & Security Note */
        .footer {
            text-align: center;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid #374151;
            color: #94a3b8;
            font-size: 0.75rem;
        }

        .security-note {
            background-color: #374151;
            padding: 0.75rem;
            border-radius: 0.375rem;
            margin-top: 1rem;
            font-size: 0.75rem;
            color: #94a3b8;
        }

        /* Responsive Design */
        @media (max-width: 640px) {
            body {
                padding: 0.5rem;
            }
            
            .card-header,
            .card-content {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="card-header">
                <div class="logo">
                    <span>vD</span>
                </div>
                <h1 class="card-title">Reset Your Password</h1>
                <p class="card-description">Create a new password for your vDeskconnect account</p>
            </div>
            
            <div class="card-content">
                <div id="successMessage" class="success-message">
                    ✓ Password reset successfully! Redirecting to login...
                </div>

                <div id="errorMessage" class="error-message"></div>

                <form id="resetForm" class="form">
                    <input type="hidden" id="email" value="USER_EMAIL">
                    <input type="hidden" id="token" value="RESET_TOKEN">

                    <div class="form-row">
                        <div class="form-group">
                            <label for="newPassword" class="label">New Password</label>
                            <input 
                                type="password" 
                                id="newPassword" 
                                class="input" 
                                placeholder="Enter your new password" 
                                minlength="6"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="confirmPassword" class="label">Confirm New Password</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                class="input" 
                                placeholder="Confirm your new password" 
                                minlength="6"
                                required
                            >
                        </div>
                    </div>

                    <button type="submit" class="btn" id="submitBtn">
                        Reset Password
                    </button>
                </form>

                <div class="security-note">
                    <strong>Security Note:</strong> This link will expire in 1 hour for your security. 
                    If you didn't request this reset, please ignore this email.
                </div>

                <div class="footer">
                    <p>vDeskconnect &copy; 2024. All rights reserved.</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('resetForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const errorDiv = document.getElementById('errorMessage');
            const successDiv = document.getElementById('successMessage');
            const newPassword = document.getElementById('newPassword');
            const confirmPassword = document.getElementById('confirmPassword');
            
            // Clear previous errors
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
            newPassword.classList.remove('error');
            confirmPassword.classList.remove('error');
            
            // Validate passwords
            if (newPassword.value.length < 6) {
                showError('Password must be at least 6 characters long', newPassword);
                return;
            }
            
            if (newPassword.value !== confirmPassword.value) {
                showError('Passwords do not match', confirmPassword);
                return;
            }
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-spinner"></span> Resetting...';
            
            try {
                const response = await fetch('http://localhost:1024/auth/reset-password/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: document.getElementById('email').value,
                        token: document.getElementById('token').value,
                        newPassword: newPassword.value
                    }),
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Show success message
                    successDiv.style.display = 'flex';
                    
                    // Redirect to login after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'http://localhost:3000/';
                    }, 2000);
                } else {
                    showError(data.message || 'Failed to reset password. Please try again.');
                }
            } catch (error) {
                showError('Network error. Please check your connection and try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Reset Password';
            }
        });
        
        function showError(message, inputField = null) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            if (inputField) {
                inputField.classList.add('error');
                inputField.focus();
            }
            
            // Auto-dismiss error after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
        
        // Validate passwords in real-time
        document.getElementById('confirmPassword').addEventListener('input', function() {
            const newPassword = document.getElementById('newPassword');
            const confirmPassword = this;
            
            if (newPassword.value !== confirmPassword.value && confirmPassword.value.length > 0) {
                confirmPassword.classList.add('error');
            } else {
                confirmPassword.classList.remove('error');
            }
        });
    </script>
</body>
</html>`
            }

            const result = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
            return result;

        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}

export default send_mail