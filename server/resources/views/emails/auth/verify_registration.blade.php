<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your registration</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #F0EEF7;
            margin: 0;
            padding: 0;
            color: #2D2B55;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #FFFFFF;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(124, 107, 196, 0.08);
            border: 1px solid #E5E4F0;
        }
        .header {
            background-color: #7C6BC4;
            padding: 32px 40px;
            text-align: center;
        }
        .header h1 {
            color: #FFFFFF;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 40px;
            text-align: center;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
            color: #6B6B8D;
            margin: 0 0 24px 0;
        }
        .code-box {
            background-color: #F0EEF7;
            border: 2px dashed #A99DDB;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
        }
        .code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 36px;
            font-weight: 700;
            color: #5E4FA2;
            letter-spacing: 8px;
            margin: 0;
        }
        .footer {
            background-color: #FAFAFC;
            padding: 24px 40px;
            text-align: center;
            border-top: 1px solid #E5E4F0;
        }
        .footer p {
            font-size: 13px;
            color: #9B9BB4;
            margin: 0;
            line-height: 1.5;
        }
        .highlight {
            color: #7C6BC4;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>vDeskConnect</h1>
        </div>
        <div class="content">
            <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #2D2B55;">Verify your email address</h2>
            <p>You're almost ready to access your new school dashboard! Please use the following 6-digit verification code to complete your registration.</p>
            
            <div class="code-box">
                <p class="code">{{ $code }}</p>
            </div>
            
            <p style="font-size: 14px;">This code will expire in <span class="highlight">15 minutes</span>. If you didn't request this code, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} vDeskConnect. All rights reserved.</p>
            <p style="margin-top: 8px;">The premier modern school management experience.</p>
        </div>
    </div>
</body>
</html>
