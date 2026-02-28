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
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - vDeskconnect</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            line-height: 1.6;
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1e293b;
            border: 1px solid #374151;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
        
        .header {
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            padding: 30px;
            text-align: center;
        }
        
        .logo {
            width: 70px;
            height: 70px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-weight: bold;
            font-size: 24px;
            color: white;
            backdrop-filter: blur(10px);
        }
        
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #f8fafc;
            margin-bottom: 10px;
        }
        
        .content {
            padding: 30px;
            text-align: center;
        }
        
        .message {
            margin-bottom: 25px;
            font-size: 16px;
            color: #e2e8f0;
            line-height: 1.6;
        }
        
        .verification-code {
            background: linear-gradient(135deg, #1e293b, #374151);
            padding: 25px;
            text-align: center;
            margin: 30px 0;
            border-radius: 12px;
            border: 1px solid #4b5563;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .code {
            color: #8b5cf6;
            margin: 0;
            font-size: 42px;
            font-weight: bold;
            letter-spacing: 8px;
            text-shadow: 0 2px 10px rgba(139, 92, 246, 0.4);
        }
        
        .note {
            background-color: #374151;
            padding: 16px;
            border-radius: 8px;
            margin: 25px 0;
            font-size: 14px;
            color: #94a3b8;
            border-left: 4px solid #f87171;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #374151;
            color: #94a3b8;
            font-size: 14px;
        }
        
        .expiry-note {
            color: #f87171;
            font-weight: 500;
            margin-top: 10px;
        }
        
        @media (max-width: 640px) {
            body {
                padding: 10px;
            }
            
            .header, .content {
                padding: 20px;
            }
            
            .title {
                font-size: 24px;
            }
            
            .code {
                font-size: 32px;
                letter-spacing: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span>vD</span>
            </div>
            <h1 class="title">Verify Your Account</h1>
        </div>
        
        <div class="content">
            <p class="message">Thank you for signing up for vDeskconnect! To complete your registration, please use the verification code below:</p>
            
            <div class="verification-code">
                <h1 class="code">${code}</h1>
            </div>
            
            <div class="note">
                <strong>Important:</strong> This verification code will expire in 10 minutes. For security reasons, please do not share this code with anyone.
            </div>
            
            <p class="message">If you didn't request this verification code, please ignore this email or contact our support team immediately.</p>
            
            <div class="footer">
                <p>vDeskconnect Team</p>
                <p class="expiry-note">Code expires in 10 minutes</p>
            </div>
        </div>
    </div>
</body>
</html>
`
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
            return result;

        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    },

    async forgot_password(email, passwordRestLink) {
        try {
            const mailOptions = {
                from: process.env.MAIL_USER,
                to: email,
                subject: 'Your vDeskConnect Password Reset',
                html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - vDeskconnect</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            line-height: 1.6;
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1e293b;
            border: 1px solid #374151;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
        
        .header {
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            padding: 30px;
            text-align: center;
        }
        
        .logo {
            width: 70px;
            height: 70px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-weight: bold;
            font-size: 24px;
            color: white;
            backdrop-filter: blur(10px);
        }
        
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #f8fafc;
            margin-bottom: 10px;
        }
        
        .description {
            color: #e2e8f0;
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .message {
            margin-bottom: 25px;
            font-size: 16px;
            color: #e2e8f0;
            line-height: 1.6;
        }
        
        .cta-button {
            display: block;
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
            font-size: 16px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            background: linear-gradient(135deg, #7c3aed, #2563eb);
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(139, 92, 246, 0.3);
        }
        
        .security-note {
            background-color: #374151;
            padding: 16px;
            border-radius: 8px;
            margin: 25px 0;
            font-size: 14px;
            color: #94a3b8;
            border-left: 4px solid #8b5cf6;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #374151;
            color: #94a3b8;
            font-size: 14px;
        }
        
        .expiry-note {
            color: #f87171;
            font-weight: 500;
            margin-top: 10px;
        }
        
        @media (max-width: 640px) {
            body {
                padding: 10px;
            }
            
            .header, .content {
                padding: 20px;
            }
            
            .title {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span>vD</span>
            </div>
            <h1 class="title">Reset Your Password</h1>
            <p class="description">Secure your vDeskconnect account</p>
        </div>
        
        <div class="content">
            <p class="message">Hello,</p>
            <p class="message">We received a request to reset your vDeskconnect password. Click the button below to create a new secure password.</p>
            
            <a href="${passwordRestLink}" class="cta-button">Reset My Password</a>
            
            <div class="security-note">
                <strong>Security Notice:</strong> For your protection, this password reset link will expire in 10 mins. If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.
            </div>
            
            <p class="message">If the button above doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #93c5fd; background-color: #1e293b; padding: 12px; border-radius: 6px; font-size: 14px; margin: 15px 0;">
                ${passwordRestLink}
            </p>
            
            <div class="footer">
                <p>vDeskconnect &copy; 2024. All rights reserved.</p>
                <p class="expiry-note">This link expires in 10 mins</p>
            </div>
        </div>
    </div>
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
    },

    async notify_verifed_user(linkToLogin) {
        try {
            const mailOptions = {
                from: process.env.MAIL_USER,
                to: email,
                subject: 'Account Verification Successful',
                html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Verified - vDeskconnect</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            line-height: 1.6;
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1e293b;
            border: 1px solid #374151;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
        
        .header {
            background: linear-gradient(135deg, #10b981, #059669);
            padding: 30px;
            text-align: center;
        }
        
        .logo {
            width: 70px;
            height: 70px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-weight: bold;
            font-size: 24px;
            color: white;
            backdrop-filter: blur(10px);
        }
        
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #f8fafc;
            margin-bottom: 10px;
        }
        
        .content {
            padding: 30px;
            text-align: center;
        }
        
        .success-icon {
            font-size: 64px;
            color: #10b981;
            margin: 20px 0;
            text-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }
        
        .message {
            margin-bottom: 20px;
            font-size: 16px;
            color: #e2e8f0;
            line-height: 1.6;
        }
        
        .cta-button {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
            font-size: 16px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            background: linear-gradient(135deg, #7c3aed, #2563eb);
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(139, 92, 246, 0.3);
        }
        
        .features {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
            margin: 30px 0;
        }
        
        .feature {
            background-color: #374151;
            padding: 15px;
            border-radius: 8px;
            flex: 1;
            min-width: 150px;
            text-align: center;
        }
        
        .feature-icon {
            color: #8b5cf6;
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #374151;
            color: #94a3b8;
            font-size: 14px;
        }
        
        @media (max-width: 640px) {
            body {
                padding: 10px;
            }
            
            .header, .content {
                padding: 20px;
            }
            
            .title {
                font-size: 24px;
            }
            
            .features {
                flex-direction: column;
            }
            
            .success-icon {
                font-size: 48px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span>vD</span>
            </div>
            <h1 class="title">Account Verified Successfully!</h1>
        </div>
        
        <div class="content">
            <div class="success-icon">✓</div>
            
            <p class="message">Congratulations! Your vDeskconnect account has been successfully verified.</p>
            <p class="message">You now have full access to all features and can start using vDeskconnect to enhance your productivity.</p>
            
            <a href=${linkToLogin} class="cta-button">Access vDeskconnect Now</a>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🚀</div>
                    <h3>Fast & Secure</h3>
                    <p>Experience blazing fast performance with enterprise-grade security</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">💼</div>
                    <h3>All Features Unlocked</h3>
                    <p>Access all premium features with your verified account</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔒</div>
                    <h3>Full Protection</h3>
                    <p>Your data is encrypted and protected at all times</p>
                </div>
            </div>
            
            <p class="message">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <div class="footer">
                <p>Welcome to vDeskconnect! We're excited to have you on board.</p>
                <p>vDeskconnect Team &copy; 2024</p>
            </div>
        </div>
    </div>
</body>
</html>
                `
            };

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