<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your vDeskconnect account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F0EEF7;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0EEF7; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 24px rgba(124, 107, 196, 0.08); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #7C6BC4 0%, #A99DDB 100%); padding: 40px 40px 30px; text-align: center;">
                            <table width="48" height="48" cellpadding="0" cellspacing="0" style="margin: 0 auto 16px; background-color: rgba(255,255,255,0.2); border-radius: 12px;">
                                <tr>
                                    <td align="center" style="font-size: 24px;">🏫</td>
                                </tr>
                            </table>
                            <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 700;">vDeskconnect</h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 12px; color: #2D2B55; font-size: 20px; font-weight: 700;">Verify your email address</h2>
                            <p style="margin: 0 0 24px; color: #6B6B8D; font-size: 14px; line-height: 1.6;">
                                You're almost done registering your school! Enter the 6-digit code below to verify your email address and complete your registration.
                            </p>

                            <!-- Verification Code -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td align="center">
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                @for ($i = 0; $i < 6; $i++)
                                                <td style="width: 48px; height: 56px; text-align: center; font-size: 24px; font-weight: 700; color: #2D2B55; background-color: #F0EEF7; border: 2px solid #E5E4F0; {{ $i === 0 ? 'border-radius: 8px 0 0 8px;' : ($i === 5 ? 'border-radius: 0 8px 8px 0;' : '') }}">
                                                    {{ $code[$i] }}
                                                </td>
                                                @endfor
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Expiry Note -->
                            <p style="margin: 0 0 24px; color: #9B9BB4; font-size: 12px; text-align: center;">
                                This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.
                            </p>

                            <!-- Divider -->
                            <hr style="border: none; border-top: 1px solid #E5E4F0; margin: 24px 0;">

                            <!-- Footer Note -->
                            <p style="margin: 0; color: #6B6B8D; font-size: 12px; line-height: 1.6;">
                                Once verified, you'll get <strong style="color: #7C6BC4;">14 days of free access</strong> to vDeskconnect with full features. After that, you can choose a plan that fits your school.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #F0EEF7; padding: 24px 40px; text-align: center; border-top: 1px solid #E5E4F0;">
                            <p style="margin: 0 0 8px; color: #9B9BB4; font-size: 12px;">
                                Need help? Contact us at <a href="mailto:support@vdeskconnect.com" style="color: #7C6BC4; text-decoration: none;">support@vdeskconnect.com</a>
                            </p>
                            <p style="margin: 0; color: #9B9BB4; font-size: 11px;">
                                © 2026 vDeskconnect. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
