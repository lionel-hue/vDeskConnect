# Email Verification API Endpoints

## Overview
This document describes the backend API endpoints needed for email verification during the school registration process.

## Endpoints

### 1. Send Verification Code
**Endpoint:** `POST /api/auth/send-verification`

**Description:** Sends a 6-digit verification code to the user's email address.

**Request Body:**
```json
{
  "email": "admin@school.edu",
  "first_name": "John",
  "school_name": "Greenfield Academy"
}
```

**Response (200 OK):**
```json
{
  "message": "Verification code sent successfully",
  "expires_in": 600
}
```

**Response (422 Validation Error):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been registered."]
  }
}
```

**Backend Logic:**
1. Validate email format and uniqueness
2. Generate random 6-digit code (e.g., `rand(100000, 999999)`)
3. Store code in database/cache with expiration (10 minutes)
4. Send email using the verification email template
5. Return success message

---

### 2. Verify Email Code
**Endpoint:** `POST /api/auth/verify-email`

**Description:** Verifies the email using the 6-digit code sent to the user.

**Request Body:**
```json
{
  "email": "admin@school.edu",
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid or expired verification code"
}
```

**Backend Logic:**
1. Look up verification code for the email
2. Check if code matches and hasn't expired
3. Mark email as verified in database
4. Delete used verification code
5. Return success or error

---

### 3. Register Admin (with verification check)
**Endpoint:** `POST /api/auth/register-admin`

**Description:** Registers the school admin after email verification. This endpoint should check that the email has been verified before allowing registration.

**Request Body:**
```json
{
  "school_name": "Greenfield Academy",
  "country": "NG",
  "timezone": "Africa/Lagos",
  "currency": "NGN",
  "admin_first_name": "John",
  "admin_last_name": "Doe",
  "admin_email": "admin@school.edu",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "message": "School registered successfully",
  "school": {
    "id": 1,
    "name": "Greenfield Academy",
    "country": "NG",
    "trial_ends_at": "2026-04-23T00:00:00Z"
  },
  "user": {
    "id": 1,
    "email": "admin@school.edu",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "must_change_password": false
  },
  "trial_days": 14
}
```

**Response (403 Forbidden - Email not verified):**
```json
{
  "message": "Please verify your email before registering"
}
```

**Backend Logic:**
1. Check if email has been verified
2. If not verified, return 403 error
3. Validate all input fields
4. Create school record
5. Create admin user with verified email
6. Start 14-day free trial
7. Return school and user data

---

## Database Changes

### Add to `users` table:
```sql
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN verification_code VARCHAR(6) NULL;
ALTER TABLE users ADD COLUMN verification_code_expires_at TIMESTAMP NULL;
```

### New table for pending registrations:
```sql
CREATE TABLE pending_registrations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email)
);
```

---

## Email Template Variables

The email template (`model/email-templates/verification-email.html`) uses the following variables:

| Variable | Description |
|----------|-------------|
| `{{first_name}}` | Admin's first name |
| `{{school_name}}` | Name of the school being registered |
| `{{verification_code}}` | The 6-digit verification code |
| `{{email}}` | The admin's email address |
| `{{country}}` | School's country |
| `{{privacy_url}}` | Link to privacy policy |
| `{{terms_url}}` | Link to terms of service |
| `{{support_url}}` | Link to support page |

---

## Laravel Implementation Example

```php
// App/Http/Controllers/Auth/VerificationController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VerificationController extends Controller
{
    /**
     * Send verification code to email
     */
    public function sendVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:pending_registrations,email|unique:users,email',
            'first_name' => 'required|string|max:255',
            'school_name' => 'required|string|max:255',
        ]);

        // Generate 6-digit code
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store in database
        DB::table('pending_registrations')->updateOrInsert(
            ['email' => $request->email],
            [
                'verification_code' => $code,
                'first_name' => $request->first_name,
                'school_name' => $request->school_name,
                'expires_at' => Carbon::now()->addMinutes(10),
            ]
        );

        // Send email
        Mail::to($request->email)->send(new VerificationCodeMail(
            $request->first_name,
            $request->school_name,
            $code
        ));

        return response()->json([
            'message' => 'Verification code sent successfully',
            'expires_in' => 600,
        ]);
    }

    /**
     * Verify email code
     */
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $pending = DB::table('pending_registrations')
            ->where('email', $request->email)
            ->where('verification_code', $request->code)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$pending) {
            return response()->json([
                'message' => 'Invalid or expired verification code',
            ], 400);
        }

        // Mark as verified (you can create a verified_emails table or similar)
        DB::table('verified_emails')->updateOrInsert(
            ['email' => $request->email],
            ['verified_at' => Carbon::now()]
        );

        // Delete pending registration
        DB::table('pending_registrations')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Email verified successfully',
            'verified' => true,
        ]);
    }
}
```
