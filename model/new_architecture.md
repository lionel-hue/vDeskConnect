# **vDeskconnect - System Architecture Specification**
## **Version 3.0 (Multi-Country SaaS Edition)**
**Date:** February 2026  
**Status:** Ready for Development  
**Stack:** Next.js 14+ (Frontend) + Laravel 11 (Backend) + PostgreSQL

---

## **1. Executive Summary**

### **1.1 Project Vision**
**vDeskconnect** is a **multi-tenant, country-agnostic School Management System (SMS) and Learning Management System (LMS)** designed to serve educational institutions across **any country** with **any education system** (Nigerian, French, British, American, IB, etc.).

### **1.2 Key Differentiators**
| Feature | v1.0 (Old) | v3.0 (New) |
| :--- | :--- | :--- |
| **Target Market** | Nigerian Schools Only | **Global (Any Country)** |
| **Academic Structure** | Hardcoded (JSS/SSS) | **100% Configurable** |
| **Exams** | ❌ Not Included | ✅ **MCQ + Theory + File Upload** |
| **Events** | ❌ Not Included | ✅ **Role-Based Calendar** |
| **Results** | ❌ Not Included | ✅ **Report Cards + Result Checking** |
| **Customization** | Code Changes Required | **Admin Dashboard Configuration** |

### **1.3 Core Capabilities**
1.  **Multi-Country Support:** Admins configure terms, grades, subjects, and grading scales without code changes.
2.  **Exam Engine:** Timed exams with MCQ, Theory, and File Upload (PNG, JPG, PDF) support.
3.  **Events Calendar:** School-wide events with role-based visibility.
4.  **Result Management:** Grade books, report cards, and secure result checking portals.
5.  **Invitation System:** Secure student/teacher onboarding via invitation codes.

---

## **2. System Architecture**

### **2.1 Technology Stack**

| Component | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14+** | Server-side rendering, optimized routing, multi-tenant support. |
| **UI Framework** | **Tailwind CSS** | Rapid styling, consistent design system, mobile-first. |
| **Backend** | **Laravel 11** | Robust MVC, Eloquent ORM, built-in Auth (Sanctum), Queues, Jobs. |
| **Database** | **PostgreSQL 16** | Relational integrity, JSONB for flexible configs, robust querying. |
| **File Storage** | **AWS S3 / MinIO** | Secure storage for exam uploads, resources, profiles. |
| **Authentication** | **Laravel Sanctum** | Secure API token authentication for SPAs. |
| **Deployment** | **Docker + Nginx** | Containerization, reverse proxy, scalability. |

### **2.2 Multi-Tenancy Architecture**
```
┌─────────────────────────────────────────────────────────┐
│                    vDeskconnect Cloud                    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  School A    │  │  School B    │  │  School C    │  │
│  │  (Nigeria)   │  │  (Benin)     │  │  (France)    │  │
│  │  JSS/SSS     │  │  Collège     │  │  Lycée       │  │
│  │  Terms       │  │  Trimesters  │  │  Semesters   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
├─────────────────────────────────────────────────────────┤
│              Shared Infrastructure (Laravel + PG)        │
└─────────────────────────────────────────────────────────┘
```
**Tenancy Strategy:** **Database-level isolation** via `school_id` on all tables (Single Database, Multi-Tenant).

---

## **3. Database Architecture (SaaS-Ready Model)**

### **3.1 Key Architectural Principles**
1.  **Surrogate Keys:** All tables use `id` (BigInt/UUID). **No composite primary keys.**
2.  **Snake_Case:** All tables and columns are lowercase snake_case (`lesson_notes`, not `Note_Of_Lesson`).
3.  **School Scoping:** Every academic table includes `school_id` for multi-tenancy.
4.  **Configuration-Driven:** Academic structures (terms, grades, subjects) are **admin-configurable**, not hardcoded.
5.  **Polymorphic Resources:** Single `resources` table for PDFs, Videos, Images, Exam Uploads.

### **3.2 Entity Relationship Overview**

#### **A. Multi-Tenancy & Configuration**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **schools** | `id`, `name`, `country`, `timezone`, `currency`, `logo_url`, `config` (JSONB), `active` | Tenant isolation. Config stores terms, grading scales, labels. |
| **academic_sessions** | `id`, `school_id`, `name` (2025/2026), `start_date`, `end_date`, `active` | School year/session. |
| **academic_terms** | `id`, `school_id`, `session_id`, `name` (Term 1, Trimestre 1), `start_date`, `end_date`, `order` | Configurable terms/semesters/trimesters. |

#### **B. Authentication & Users**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **users** | `id`, `school_id`, `email`, `password`, `role` (student, teacher, admin), `verified`, `last_login` | Central auth table. |
| **profiles** | `id`, `user_id`, `type` (student, teacher), `data` (JSONB), `avatar_url` | Polymorphic profile data (medical, contact, etc.). |
| **invite_codes** | `id`, `school_id`, `code`, `type`, `created_by`, `used_by`, `expires_at`, `used_at` | Secure onboarding. |

#### **C. Academic Structure (Configurable)**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **grade_levels** | `id`, `school_id`, `name` (JSS1, 6ème, Grade 6), `short_name`, `order`, `cycle` (Junior, Collège) | Admin-defined classes. |
| **departments** | `id`, `school_id`, `name` (Science, Série C), `code` | Admin-defined streams/departments. |
| **subjects** | `id`, `school_id`, `name`, `code`, `department_id` (nullable) | Admin-defined subjects. |
| **teacher_subjects** | `id`, `school_id`, `teacher_id`, `subject_id`, `grade_level_id` | Which teacher teaches what. |

#### **D. Curriculum (Scheme of Work)**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **schemes_of_work** | `id`, `school_id`, `subject_id`, `grade_level_id`, `term_id`, `week_number`, `topic` | Weekly curriculum plan. |
| **lesson_notes** | `id`, `school_id`, `scheme_id`, `aspect`, `contact_number`, `objective`, `content`, `methodology`, `evaluation` | Detailed teacher guide. |

#### **E. Lectures & Attendance**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **lectures** | `id`, `school_id`, `teacher_id`, `grade_level_id`, `subject_id`, `scheduled_at`, `duration_minutes`, `status`, `meeting_link` | Class sessions (online/offline). |
| **attendances** | `id`, `school_id`, `lecture_id`, `student_id`, `status`, `checked_at` | Attendance tracking. |

#### **F. Exams & Assessments** ⭐ **NEW**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **exams** | `id`, `school_id`, `subject_id`, `grade_level_id`, `term_id`, `title`, `type` (MCQ, Theory, Mixed), `duration_minutes`, `start_at`, `end_at`, `published` | Exam sessions. |
| **exam_questions** | `id`, `exam_id`, `type` (mcq, theory), `question_text`, `options` (JSONB for MCQ), `correct_answer`, `marks` | Question bank. |
| **exam_submissions** | `id`, `exam_id`, `student_id`, `started_at`, `submitted_at`, `auto_score`, `manual_score`, `status` (pending, graded) | Student submissions. |
| **exam_answers** | `id`, `submission_id`, `question_id`, `answer_text`, `selected_option`, `file_url` (for uploads), `score` | Individual answers. |

#### **G. Events & Calendar** ⭐ **NEW**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **events** | `id`, `school_id`, `title`, `description`, `start_at`, `end_at`, `location`, `visibility` (all, students, teachers, admins), `created_by` | School events. |
| **event_attendees** | `id`, `event_id`, `user_id`, `status` (going, maybe, not_going) | RSVP tracking. |

#### **H. Results & Grading** ⭐ **NEW**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **grade_scales** | `id`, `school_id`, `name`, `scale` (JSONB: `{ "A": {min: 70, max: 100}, "B": {min: 60, max: 69} }`) | Configurable grading systems. |
| **student_grades** | `id`, `school_id`, `student_id`, `subject_id`, `term_id`, `ca_score`, `exam_score`, `total_score`, `grade`, `position`, `remark` | Final grades. |
| **report_cards** | `id`, `school_id`, `student_id`, `term_id`, `session_id`, `pdf_url`, `generated_at`, `published` | Generated report cards. |
| **result_checks** | `id`, `school_id`, `student_id`, `pin`, `session_id`, `used`, `used_at` | Secure result checking pins. |

#### **I. Resources & Files**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **resources** | `id`, `school_id`, `lecture_id` (nullable), `exam_id` (nullable), `type` (pdf, video, image, submission), `url`, `uploaded_by`, `accessible_at` | Polymorphic file storage. |

---

## **4. Functional Modules**

### **4.1 Multi-Country Customization Engine**
**Problem:** Nigerian schools use "Terms" (1-3), French schools use "Trimestres" (1-3), American schools use "Semesters" (Fall, Spring).

**Solution:** **JSONB Configuration Column** on `schools` table.

```json
// schools.config (JSONB)
{
  "academic_labels": {
    "grade_label": "Class",
    "term_label": "Term",
    "department_label": "Department"
  },
  "academic_structure": {
    "terms_per_year": 3,
    "term_names": ["Term 1", "Term 2", "Term 3"],
    "weeks_per_term": 12,
    "grading_scale": "percentage"
  },
  "exam_settings": {
    "allow_file_upload": true,
    "allowed_file_types": ["png", "jpg", "pdf"],
    "max_file_size_mb": 10,
    "auto_grade_mcq": true
  },
  "localization": {
    "currency": "NGN",
    "timezone": "Africa/Lagos",
    "date_format": "DD/MM/YYYY"
  }
}
```

**Admin Dashboard:** School admins can modify these settings via UI without code changes.

---

### **4.2 Exam Engine Module** ⭐ **NEW**

#### **4.2.1 Exam Types**
| Type | Description | Auto-Grade | File Upload |
| :--- | :--- | :--- | :--- |
| **MCQ** | Multiple Choice Questions | ✅ Yes | ❌ No |
| **Theory** | Essay/Short Answer | ❌ No (Manual) | ✅ Yes (PNG, JPG, PDF) |
| **Mixed** | Combination of Both | ⚠️ Partial | ✅ Yes |

#### **4.2.2 Exam Flow**
```
1. Teacher Creates Exam
   ├── Set Title, Subject, Grade Level
   ├── Set Duration (e.g., 60 minutes)
   ├── Set Start/End Time Window
   └── Add Questions (MCQ + Theory)

2. Student Takes Exam
   ├── Timer Starts (Countdown)
   ├── Answer MCQ (Click Option)
   ├── Answer Theory (Type OR Upload Image/PDF)
   └── Submit (Auto-locks at deadline)

3. Grading
   ├── MCQ: Auto-graded instantly
   ├── Theory: Teacher grades manually
   └── Results: Published to Student Portal
```

#### **4.2.3 Security Features**
*   **Timer Enforcement:** Exam auto-submits when time expires.
*   **File Validation:** Only allowed file types (PNG, JPG, PDF) accepted.
*   **Plagiarism Check:** (Future) Integration with plagiarism APIs.
*   **Session Locking:** One active exam session per student.

---

### **4.3 Events & Calendar Module** ⭐ **NEW**

#### **4.3.1 Event Visibility**
| Visibility | Who Can See |
| :--- | :--- |
| **All** | Students, Teachers, Admins |
| **Students Only** | Students |
| **Teachers Only** | Teachers, Admins |
| **Admins Only** | Admins |
| **Specific Grades** | Selected Grade Levels |

#### **4.3.2 Event Types**
*   **Academic:** Exams, Holidays, Resume Dates
*   **Social:** Sports Day, Cultural Day, Graduation
*   **Administrative:** Staff Meetings, Parent-Teacher Conferences
*   **Deadlines:** Assignment Due, Fee Payment

#### **4.3.3 Features**
*   **RSVP Tracking:** Students/Teachers confirm attendance.
*   **Reminders:** Email/Push notifications before events.
*   **Calendar Sync:** Export to Google Calendar, iCal.

---

### **4.4 Results & Grading Module** ⭐ **NEW**

#### **4.4.1 Grading Workflow**
```
1. Teacher Inputs Scores
   ├── Continuous Assessment (CA): 30%
   ├── Exam Score: 70%
   └── Total: 100%

2. System Calculates
   ├── Grade (A, B, C, D, E, F)
   ├── Position (1st, 2nd, 3rd...)
   └── Remark (Excellent, Good, Fair, Poor)

3. Report Card Generation
   ├── PDF Generation (Laravel DomPDF)
   ├── Digital Signature (Head Teacher)
   └── Publish to Student Portal
```

#### **4.4.2 Result Checking Portal**
*   **Secure PIN System:** Students buy/use PIN to check results.
*   **Public Verification:** Parents can verify results with Student ID + PIN.
*   **Downloadable Report Cards:** PDF download with school watermark.

#### **4.4.3 Grading Scale Configuration**
Admins can define custom grading scales per school:
```json
// grade_scales.scale (JSONB)
{
  "A": { "min": 70, "max": 100, "remark": "Excellent" },
  "B": { "min": 60, "max": 69, "remark": "Very Good" },
  "C": { "min": 50, "max": 59, "remark": "Good" },
  "D": { "min": 45, "max": 49, "remark": "Fair" },
  "E": { "min": 40, "max": 44, "remark": "Pass" },
  "F": { "min": 0, "max": 39, "remark": "Fail" }
}
```

---

### **4.5 Invitation & Onboarding**

#### **4.5.1 Invitation Codes**
*   **Generated By:** Admins only.
*   **Types:** Student, Teacher.
*   **Limits:** Single-use, Expiry Date, Max Uses.
*   **Security:** Codes are hashed in database.

#### **4.5.2 Signup Flow**
```
1. User Selects Role (Student/Teacher)
2. Enters Invitation Code
3. Fills Multi-Step Form (Personal, Academic, Medical)
4. Email Verification (6-digit code)
5. Admin Approval (Optional for Teachers)
6. Account Active
```

---

## **5. Corrected Minimal Coverage (Functional Dependencies)**

**Notation:** `X → Y` means "X determines Y". `#` indicates a Foreign Key.

### **5.1 Simple Functional Dependencies**
```text
user_id       → email, password, role, verified, school_id
school_id     → name, country, timezone, currency, config
session_id    → school_id, name, start_date, end_date, active
term_id       → school_id, session_id, name, start_date, end_date, order
grade_level_id → school_id, name, short_name, order, cycle
subject_id    → school_id, name, code, department_id
exam_id       → school_id, subject_id, grade_level_id, term_id, title, type, duration
event_id      → school_id, title, description, start_at, end_at, visibility
submission_id → exam_id, student_id, started_at, submitted_at, status
```

### **5.2 Composite Functional Dependencies**
```text
(exam_id, question_id) → question_text, options, correct_answer, marks
(submission_id, question_id) → answer_text, selected_option, file_url, score
(student_id, subject_id, term_id) → ca_score, exam_score, total_score, grade, position
```

### **5.3 Referential Dependencies (Foreign Keys)**
```text
user_id       → #school_id
profile_id    → #user_id
session_id    → #school_id
term_id       → #school_id, #session_id
grade_level_id → #school_id
subject_id    → #school_id, #department_id
teacher_subjects → #school_id, #teacher_id, #subject_id, #grade_level_id
scheme_id     → #school_id, #subject_id, #grade_level_id, #term_id
lesson_note_id → #school_id, #scheme_id
lecture_id    → #school_id, #teacher_id, #grade_level_id, #subject_id
attendance_id → #school_id, #lecture_id, #student_id
exam_id       → #school_id, #subject_id, #grade_level_id, #term_id
exam_question_id → #exam_id
submission_id → #exam_id, #student_id
exam_answer_id → #submission_id, #question_id
event_id      → #school_id, #created_by
student_grade_id → #school_id, #student_id, #subject_id, #term_id
report_card_id → #school_id, #student_id, #term_id, #session_id
resource_id   → #school_id, #lecture_id (nullable), #exam_id (nullable)
```

---

## **6. API Routes (Core)**

### **6.1 Authentication**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Student/Teacher Signup | Public (Requires Invite Code) |
| `POST` | `/api/auth/login` | User Login | Public |
| `POST` | `/api/auth/verify` | Email Verification | Public |
| `POST` | `/api/auth/forgot-password` | Request Reset Link | Public |
| `POST` | `/api/auth/reset-password` | Reset Password | Public (Token Required) |
| `GET` | `/api/user` | Get Current User | Protected |
| `POST` | `/api/auth/logout` | User Logout | Protected |

### **6.2 School Configuration**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/school/config` | Get School Configuration | Protected |
| `PUT` | `/api/school/config` | Update School Configuration | Admin Only |
| `GET` | `/api/school/sessions` | List Academic Sessions | Protected |
| `POST` | `/api/school/sessions` | Create Session | Admin Only |
| `GET` | `/api/school/terms` | List Terms | Protected |
| `POST` | `/api/school/terms` | Create Term | Admin Only |
| `GET` | `/api/school/grade-levels` | List Grade Levels | Protected |
| `POST` | `/api/school/grade-levels` | Create Grade Level | Admin Only |
| `GET` | `/api/school/subjects` | List Subjects | Protected |
| `POST` | `/api/school/subjects` | Create Subject | Admin Only |

### **6.3 Exams**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/exams` | List Exams | Protected |
| `POST` | `/api/exams` | Create Exam | Teacher/Admin Only |
| `GET` | `/api/exams/{id}` | Get Exam Details | Protected |
| `PUT` | `/api/exams/{id}` | Update Exam | Teacher/Admin Only |
| `DELETE` | `/api/exams/{id}` | Delete Exam | Admin Only |
| `POST` | `/api/exams/{id}/start` | Start Exam Session | Student Only |
| `POST` | `/api/exams/{id}/submit` | Submit Exam | Student Only |
| `GET` | `/api/exams/{id}/submissions` | View Submissions | Teacher/Admin Only |
| `PUT` | `/api/exams/{id}/submissions/{submission_id}/grade` | Grade Submission | Teacher Only |

### **6.4 Events**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | List Events | Protected |
| `POST` | `/api/events` | Create Event | Admin Only |
| `PUT` | `/api/events/{id}` | Update Event | Admin Only |
| `DELETE` | `/api/events/{id}` | Delete Event | Admin Only |
| `POST` | `/api/events/{id}/rsvp` | RSVP to Event | Protected |

### **6.5 Results**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/results/my-results` | Get Student's Results | Student Only |
| `GET` | `/api/results/students/{id}` | Get Student Results | Teacher/Admin Only |
| `POST` | `/api/results/input` | Input Scores | Teacher Only |
| `GET` | `/api/results/report-cards/{id}` | Download Report Card | Protected |
| `POST` | `/api/results/check` | Public Result Check (PIN) | Public |
| `POST` | `/api/results/pins` | Generate Result Pins | Admin Only |

### **6.6 Invitations**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/invites` | List Invite Codes | Admin Only |
| `POST` | `/api/invites/generate` | Generate Invite Code | Admin Only |
| `DELETE` | `/api/invites/{id}` | Delete Invite Code | Admin Only |
| `POST` | `/api/invites/{id}/regenerate` | Regenerate Code | Admin Only |

---

## **7. Security & Compliance**

### **7.1 Access Control Matrix**
| Feature | Student | Teacher | Admin |
| :--- | :---: | :---: | :---: |
| **View Dashboard** | ✅ | ✅ | ✅ |
| **Join Class (Invite)** | ✅ | ❌ | ❌ |
| **Create Lecture** | ❌ | ✅ | ✅ |
| **Create Exam** | ❌ | ✅ | ✅ |
| **Grade Exam** | ❌ | ✅ | ✅ |
| **View All Results** | ❌ (Own Only) | ✅ (Own Classes) | ✅ |
| **Generate Invites** | ❌ | ❌ | ✅ |
| **Configure School** | ❌ | ❌ | ✅ |
| **Create Events** | ❌ | ❌ | ✅ |
| **View Events** | ✅ (Based on Visibility) | ✅ (Based on Visibility) | ✅ |

### **7.2 Data Protection**
*   **Encryption:** All passwords hashed (Bcrypt/Argon2id). Sensitive data encrypted at rest.
*   **Transport:** HTTPS enforced in production.
*   **Input Validation:** Sanitization on both Client (UX) and Server (Security).
*   **File Uploads:** Virus scanning, MIME type validation, size limits.
*   **Exam Security:** Session locking, timer enforcement, upload validation.

---

## **8. Deployment Strategy**

### **8.1 Environment Variables**
```bash
APP_NAME=vDeskconnect
APP_URL=https://vdeskconnect.com
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=vdeskconnect
DB_USERNAME=postgres
DB_PASSWORD=<<Secure_Password>>

JWT_SECRET=<<Secure_Random_String>>
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,vdeskconnect.com

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<<SMTP_User>>
MAIL_PASSWORD=<<SMTP_Pass>>

AWS_BUCKET=vdeskconnect-files
AWS_ACCESS_KEY_ID=<<AWS_Key>>
AWS_SECRET_ACCESS_KEY=<<AWS_Secret>>
AWS_DEFAULT_REGION=us-east-1
```

### **8.2 CI/CD Pipeline**
1.  **Build:** Docker image creation for Laravel & Next.js.
2.  **Test:** Run PHPUnit (Backend) and Jest/Vitest (Frontend) tests.
3.  **Migrate:** Run `php artisan migrate --force` on deployment.
4.  **Seed:** Run `php artisan db:seed` for default configurations.
5.  **Deploy:** Push to production server (VPS or Cloud).

---

## **9. Answers to Your Specific Questions**

### **Q1: Does my current model include an exam model?**
**Answer:** ❌ **No.** Your v1.0 model (Express/React) does **not** include:
*   Exam sessions
*   Question banks (MCQ/Theory)
*   Student submissions
*   Grading workflows
*   Result checking

**v3.0 Solution:** Complete **Exam Engine Module** added (Section 4.2).

### **Q2: Does my current model include events?**
**Answer:** ❌ **No.** Your v1.0 model does **not** include:
*   School calendar
*   Event visibility rules
*   RSVP tracking

**v3.0 Solution:** Complete **Events Module** added (Section 4.3).

### **Q3: Is there a result checking section?**
**Answer:** ❌ **No.** Your v1.0 model does **not** include:
*   Grade books
*   Report cards
*   Result checking PINs

**v3.0 Solution:** Complete **Results Module** added (Section 4.4).

### **Q4: Can an admin build classes, name them, add subjects, etc.?**
**Answer:** ❌ **Not in v1.0.** Your v1.0 model has hardcoded tables (`Junior`, `Senior`, `JSScheme`, `SSScheme`).

**v3.0 Solution:** ✅ **Yes.** Admins can:
*   Create unlimited grade levels (JSS1, 6ème, Grade 6, etc.)
*   Name them anything
*   Create subjects per school
*   Define terms (3 terms, 2 semesters, 3 trimesters)
*   Configure grading scales (A-F, 1-10, Percentages)
*   All via **Admin Dashboard** (No code changes needed)

### **Q5: Can students upload PNG/JPG for theory exams?**
**Answer:** ✅ **Yes (v3.0).** The `exam_answers` table includes:
*   `answer_text` (for typed responses)
*   `file_url` (for PNG, JPG, PDF uploads)
*   File validation on upload (MIME type, size limits)

---

## **10. Migration Path (v1.0 → v3.0)**

### **Phase 1: Database Migration (Week 1-2)**
1.  Create new PostgreSQL database with v3.0 schema.
2.  Write Laravel migrations for all tables.
3.  Create seeder for default school configurations.
4.  **Do NOT migrate old data** (v1.0 schema is incompatible).

### **Phase 2: Backend Development (Week 3-6)**
1.  Set up Laravel 11 project.
2.  Implement Authentication (Sanctum).
3.  Build School Configuration APIs.
4.  Build Exam Engine APIs.
5.  Build Events APIs.
6.  Build Results APIs.

### **Phase 3: Frontend Development (Week 7-12)**
1.  Set up Next.js 14 project.
2.  Build Admin Dashboard (School Config, Users, Exams).
3.  Build Teacher Dashboard (Lectures, Exams, Grading).
4.  Build Student Dashboard (Classes, Exams, Results).
5.  Build Public Result Checking Portal.

### **Phase 4: Testing & Deployment (Week 13-14)**
1.  Unit Testing (PHPUnit, Vitest).
2.  Integration Testing (API endpoints).
3.  Security Audit (Penetration testing).
4.  Deploy to production.

---

## **11. Conclusion**

This **v3.0 Architecture Document** transforms vDeskconnect from a **Nigerian-specific school app** into a **global, multi-tenant SaaS platform** that can serve:
*   🇳🇬 Nigerian Schools (JSS/SSS, Terms)
*   🇧🇯 Benin Schools (Collège/Lycée, Trimestres, Séries)
*   🇫🇷 French Schools (6ème-Terminale, Semesters)
*   🇺🇸 American Schools (Grade 1-12, Semesters, GPA)
*   🌍 **Any Country** (Configurable via Admin Dashboard)

**Key Achievements:**
1.  ✅ **100% Customizable** - Admins configure everything without code.
2.  ✅ **Exam Engine** - MCQ + Theory + File Upload (PNG, JPG, PDF).
3.  ✅ **Events Calendar** - Role-based visibility.
4.  ✅ **Result Management** - Grade books, report cards, PIN checking.
5.  ✅ **Multi-Tenant** - Single codebase, unlimited schools.

**Your app is now ready to be rebuilt!** 🚀

---
**End of Document**# **vDeskconnect - System Architecture Specification**
## **Version 3.0 (Multi-Country SaaS Edition)**
**Date:** February 2026  
**Status:** Ready for Development  
**Stack:** Next.js 14+ (Frontend) + Laravel 11 (Backend) + PostgreSQL

---

## **1. Executive Summary**

### **1.1 Project Vision**
**vDeskconnect** is a **multi-tenant, country-agnostic School Management System (SMS) and Learning Management System (LMS)** designed to serve educational institutions across **any country** with **any education system** (Nigerian, French, British, American, IB, etc.).

### **1.2 Key Differentiators**
| Feature | v1.0 (Old) | v3.0 (New) |
| :--- | :--- | :--- |
| **Target Market** | Nigerian Schools Only | **Global (Any Country)** |
| **Academic Structure** | Hardcoded (JSS/SSS) | **100% Configurable** |
| **Exams** | ❌ Not Included | ✅ **MCQ + Theory + File Upload** |
| **Events** | ❌ Not Included | ✅ **Role-Based Calendar** |
| **Results** | ❌ Not Included | ✅ **Report Cards + Result Checking** |
| **Customization** | Code Changes Required | **Admin Dashboard Configuration** |

### **1.3 Core Capabilities**
1.  **Multi-Country Support:** Admins configure terms, grades, subjects, and grading scales without code changes.
2.  **Exam Engine:** Timed exams with MCQ, Theory, and File Upload (PNG, JPG, PDF) support.
3.  **Events Calendar:** School-wide events with role-based visibility.
4.  **Result Management:** Grade books, report cards, and secure result checking portals.
5.  **Invitation System:** Secure student/teacher onboarding via invitation codes.

---

## **2. System Architecture**

### **2.1 Technology Stack**

| Component | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14+** | Server-side rendering, optimized routing, multi-tenant support. |
| **UI Framework** | **Tailwind CSS** | Rapid styling, consistent design system, mobile-first. |
| **Backend** | **Laravel 11** | Robust MVC, Eloquent ORM, built-in Auth (Sanctum), Queues, Jobs. |
| **Database** | **PostgreSQL 16** | Relational integrity, JSONB for flexible configs, robust querying. |
| **File Storage** | **AWS S3 / MinIO** | Secure storage for exam uploads, resources, profiles. |
| **Authentication** | **Laravel Sanctum** | Secure API token authentication for SPAs. |
| **Deployment** | **Docker + Nginx** | Containerization, reverse proxy, scalability. |

### **2.2 Multi-Tenancy Architecture**
```
┌─────────────────────────────────────────────────────────┐
│                    vDeskconnect Cloud                    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  School A    │  │  School B    │  │  School C    │  │
│  │  (Nigeria)   │  │  (Benin)     │  │  (France)    │  │
│  │  JSS/SSS     │  │  Collège     │  │  Lycée       │  │
│  │  Terms       │  │  Trimesters  │  │  Semesters   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
├─────────────────────────────────────────────────────────┤
│              Shared Infrastructure (Laravel + PG)        │
└─────────────────────────────────────────────────────────┘
```
**Tenancy Strategy:** **Database-level isolation** via `school_id` on all tables (Single Database, Multi-Tenant).

---

## **3. Database Architecture (SaaS-Ready Model)**

### **3.1 Key Architectural Principles**
1.  **Surrogate Keys:** All tables use `id` (BigInt/UUID). **No composite primary keys.**
2.  **Snake_Case:** All tables and columns are lowercase snake_case (`lesson_notes`, not `Note_Of_Lesson`).
3.  **School Scoping:** Every academic table includes `school_id` for multi-tenancy.
4.  **Configuration-Driven:** Academic structures (terms, grades, subjects) are **admin-configurable**, not hardcoded.
5.  **Polymorphic Resources:** Single `resources` table for PDFs, Videos, Images, Exam Uploads.

### **3.2 Entity Relationship Overview**

#### **A. Multi-Tenancy & Configuration**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **schools** | `id`, `name`, `country`, `timezone`, `currency`, `logo_url`, `config` (JSONB), `active` | Tenant isolation. Config stores terms, grading scales, labels. |
| **academic_sessions** | `id`, `school_id`, `name` (2025/2026), `start_date`, `end_date`, `active` | School year/session. |
| **academic_terms** | `id`, `school_id`, `session_id`, `name` (Term 1, Trimestre 1), `start_date`, `end_date`, `order` | Configurable terms/semesters/trimesters. |

#### **B. Authentication & Users**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **users** | `id`, `school_id`, `email`, `password`, `role` (student, teacher, admin), `verified`, `last_login` | Central auth table. |
| **profiles** | `id`, `user_id`, `type` (student, teacher), `data` (JSONB), `avatar_url` | Polymorphic profile data (medical, contact, etc.). |
| **invite_codes** | `id`, `school_id`, `code`, `type`, `created_by`, `used_by`, `expires_at`, `used_at` | Secure onboarding. |

#### **C. Academic Structure (Configurable)**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **grade_levels** | `id`, `school_id`, `name` (JSS1, 6ème, Grade 6), `short_name`, `order`, `cycle` (Junior, Collège) | Admin-defined classes. |
| **departments** | `id`, `school_id`, `name` (Science, Série C), `code` | Admin-defined streams/departments. |
| **subjects** | `id`, `school_id`, `name`, `code`, `department_id` (nullable) | Admin-defined subjects. |
| **teacher_subjects** | `id`, `school_id`, `teacher_id`, `subject_id`, `grade_level_id` | Which teacher teaches what. |

#### **D. Curriculum (Scheme of Work)**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **schemes_of_work** | `id`, `school_id`, `subject_id`, `grade_level_id`, `term_id`, `week_number`, `topic` | Weekly curriculum plan. |
| **lesson_notes** | `id`, `school_id`, `scheme_id`, `aspect`, `contact_number`, `objective`, `content`, `methodology`, `evaluation` | Detailed teacher guide. |

#### **E. Lectures & Attendance**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **lectures** | `id`, `school_id`, `teacher_id`, `grade_level_id`, `subject_id`, `scheduled_at`, `duration_minutes`, `status`, `meeting_link` | Class sessions (online/offline). |
| **attendances** | `id`, `school_id`, `lecture_id`, `student_id`, `status`, `checked_at` | Attendance tracking. |

#### **F. Exams & Assessments** ⭐ **NEW**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **exams** | `id`, `school_id`, `subject_id`, `grade_level_id`, `term_id`, `title`, `type` (MCQ, Theory, Mixed), `duration_minutes`, `start_at`, `end_at`, `published` | Exam sessions. |
| **exam_questions** | `id`, `exam_id`, `type` (mcq, theory), `question_text`, `options` (JSONB for MCQ), `correct_answer`, `marks` | Question bank. |
| **exam_submissions** | `id`, `exam_id`, `student_id`, `started_at`, `submitted_at`, `auto_score`, `manual_score`, `status` (pending, graded) | Student submissions. |
| **exam_answers** | `id`, `submission_id`, `question_id`, `answer_text`, `selected_option`, `file_url` (for uploads), `score` | Individual answers. |

#### **G. Events & Calendar** ⭐ **NEW**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **events** | `id`, `school_id`, `title`, `description`, `start_at`, `end_at`, `location`, `visibility` (all, students, teachers, admins), `created_by` | School events. |
| **event_attendees** | `id`, `event_id`, `user_id`, `status` (going, maybe, not_going) | RSVP tracking. |

#### **H. Results & Grading** ⭐ **NEW**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **grade_scales** | `id`, `school_id`, `name`, `scale` (JSONB: `{ "A": {min: 70, max: 100}, "B": {min: 60, max: 69} }`) | Configurable grading systems. |
| **student_grades** | `id`, `school_id`, `student_id`, `subject_id`, `term_id`, `ca_score`, `exam_score`, `total_score`, `grade`, `position`, `remark` | Final grades. |
| **report_cards** | `id`, `school_id`, `student_id`, `term_id`, `session_id`, `pdf_url`, `generated_at`, `published` | Generated report cards. |
| **result_checks** | `id`, `school_id`, `student_id`, `pin`, `session_id`, `used`, `used_at` | Secure result checking pins. |

#### **I. Resources & Files**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **resources** | `id`, `school_id`, `lecture_id` (nullable), `exam_id` (nullable), `type` (pdf, video, image, submission), `url`, `uploaded_by`, `accessible_at` | Polymorphic file storage. |

---

## **4. Functional Modules**

### **4.1 Multi-Country Customization Engine**
**Problem:** Nigerian schools use "Terms" (1-3), French schools use "Trimestres" (1-3), American schools use "Semesters" (Fall, Spring).

**Solution:** **JSONB Configuration Column** on `schools` table.

```json
// schools.config (JSONB)
{
  "academic_labels": {
    "grade_label": "Class",
    "term_label": "Term",
    "department_label": "Department"
  },
  "academic_structure": {
    "terms_per_year": 3,
    "term_names": ["Term 1", "Term 2", "Term 3"],
    "weeks_per_term": 12,
    "grading_scale": "percentage"
  },
  "exam_settings": {
    "allow_file_upload": true,
    "allowed_file_types": ["png", "jpg", "pdf"],
    "max_file_size_mb": 10,
    "auto_grade_mcq": true
  },
  "localization": {
    "currency": "NGN",
    "timezone": "Africa/Lagos",
    "date_format": "DD/MM/YYYY"
  }
}
```

**Admin Dashboard:** School admins can modify these settings via UI without code changes.

---

### **4.2 Exam Engine Module** ⭐ **NEW**

#### **4.2.1 Exam Types**
| Type | Description | Auto-Grade | File Upload |
| :--- | :--- | :--- | :--- |
| **MCQ** | Multiple Choice Questions | ✅ Yes | ❌ No |
| **Theory** | Essay/Short Answer | ❌ No (Manual) | ✅ Yes (PNG, JPG, PDF) |
| **Mixed** | Combination of Both | ⚠️ Partial | ✅ Yes |

#### **4.2.2 Exam Flow**
```
1. Teacher Creates Exam
   ├── Set Title, Subject, Grade Level
   ├── Set Duration (e.g., 60 minutes)
   ├── Set Start/End Time Window
   └── Add Questions (MCQ + Theory)

2. Student Takes Exam
   ├── Timer Starts (Countdown)
   ├── Answer MCQ (Click Option)
   ├── Answer Theory (Type OR Upload Image/PDF)
   └── Submit (Auto-locks at deadline)

3. Grading
   ├── MCQ: Auto-graded instantly
   ├── Theory: Teacher grades manually
   └── Results: Published to Student Portal
```

#### **4.2.3 Security Features**
*   **Timer Enforcement:** Exam auto-submits when time expires.
*   **File Validation:** Only allowed file types (PNG, JPG, PDF) accepted.
*   **Plagiarism Check:** (Future) Integration with plagiarism APIs.
*   **Session Locking:** One active exam session per student.

---

### **4.3 Events & Calendar Module** ⭐ **NEW**

#### **4.3.1 Event Visibility**
| Visibility | Who Can See |
| :--- | :--- |
| **All** | Students, Teachers, Admins |
| **Students Only** | Students |
| **Teachers Only** | Teachers, Admins |
| **Admins Only** | Admins |
| **Specific Grades** | Selected Grade Levels |

#### **4.3.2 Event Types**
*   **Academic:** Exams, Holidays, Resume Dates
*   **Social:** Sports Day, Cultural Day, Graduation
*   **Administrative:** Staff Meetings, Parent-Teacher Conferences
*   **Deadlines:** Assignment Due, Fee Payment

#### **4.3.3 Features**
*   **RSVP Tracking:** Students/Teachers confirm attendance.
*   **Reminders:** Email/Push notifications before events.
*   **Calendar Sync:** Export to Google Calendar, iCal.

---

### **4.4 Results & Grading Module** ⭐ **NEW**

#### **4.4.1 Grading Workflow**
```
1. Teacher Inputs Scores
   ├── Continuous Assessment (CA): 30%
   ├── Exam Score: 70%
   └── Total: 100%

2. System Calculates
   ├── Grade (A, B, C, D, E, F)
   ├── Position (1st, 2nd, 3rd...)
   └── Remark (Excellent, Good, Fair, Poor)

3. Report Card Generation
   ├── PDF Generation (Laravel DomPDF)
   ├── Digital Signature (Head Teacher)
   └── Publish to Student Portal
```

#### **4.4.2 Result Checking Portal**
*   **Secure PIN System:** Students buy/use PIN to check results.
*   **Public Verification:** Parents can verify results with Student ID + PIN.
*   **Downloadable Report Cards:** PDF download with school watermark.

#### **4.4.3 Grading Scale Configuration**
Admins can define custom grading scales per school:
```json
// grade_scales.scale (JSONB)
{
  "A": { "min": 70, "max": 100, "remark": "Excellent" },
  "B": { "min": 60, "max": 69, "remark": "Very Good" },
  "C": { "min": 50, "max": 59, "remark": "Good" },
  "D": { "min": 45, "max": 49, "remark": "Fair" },
  "E": { "min": 40, "max": 44, "remark": "Pass" },
  "F": { "min": 0, "max": 39, "remark": "Fail" }
}
```

---

### **4.5 Invitation & Onboarding**

#### **4.5.1 Invitation Codes**
*   **Generated By:** Admins only.
*   **Types:** Student, Teacher.
*   **Limits:** Single-use, Expiry Date, Max Uses.
*   **Security:** Codes are hashed in database.

#### **4.5.2 Signup Flow**
```
1. User Selects Role (Student/Teacher)
2. Enters Invitation Code
3. Fills Multi-Step Form (Personal, Academic, Medical)
4. Email Verification (6-digit code)
5. Admin Approval (Optional for Teachers)
6. Account Active
```

---

## **5. Corrected Minimal Coverage (Functional Dependencies)**

**Notation:** `X → Y` means "X determines Y". `#` indicates a Foreign Key.

### **5.1 Simple Functional Dependencies**
```text
user_id       → email, password, role, verified, school_id
school_id     → name, country, timezone, currency, config
session_id    → school_id, name, start_date, end_date, active
term_id       → school_id, session_id, name, start_date, end_date, order
grade_level_id → school_id, name, short_name, order, cycle
subject_id    → school_id, name, code, department_id
exam_id       → school_id, subject_id, grade_level_id, term_id, title, type, duration
event_id      → school_id, title, description, start_at, end_at, visibility
submission_id → exam_id, student_id, started_at, submitted_at, status
```

### **5.2 Composite Functional Dependencies**
```text
(exam_id, question_id) → question_text, options, correct_answer, marks
(submission_id, question_id) → answer_text, selected_option, file_url, score
(student_id, subject_id, term_id) → ca_score, exam_score, total_score, grade, position
```

### **5.3 Referential Dependencies (Foreign Keys)**
```text
user_id       → #school_id
profile_id    → #user_id
session_id    → #school_id
term_id       → #school_id, #session_id
grade_level_id → #school_id
subject_id    → #school_id, #department_id
teacher_subjects → #school_id, #teacher_id, #subject_id, #grade_level_id
scheme_id     → #school_id, #subject_id, #grade_level_id, #term_id
lesson_note_id → #school_id, #scheme_id
lecture_id    → #school_id, #teacher_id, #grade_level_id, #subject_id
attendance_id → #school_id, #lecture_id, #student_id
exam_id       → #school_id, #subject_id, #grade_level_id, #term_id
exam_question_id → #exam_id
submission_id → #exam_id, #student_id
exam_answer_id → #submission_id, #question_id
event_id      → #school_id, #created_by
student_grade_id → #school_id, #student_id, #subject_id, #term_id
report_card_id → #school_id, #student_id, #term_id, #session_id
resource_id   → #school_id, #lecture_id (nullable), #exam_id (nullable)
```

---

## **6. API Routes (Core)**

### **6.1 Authentication**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Student/Teacher Signup | Public (Requires Invite Code) |
| `POST` | `/api/auth/login` | User Login | Public |
| `POST` | `/api/auth/verify` | Email Verification | Public |
| `POST` | `/api/auth/forgot-password` | Request Reset Link | Public |
| `POST` | `/api/auth/reset-password` | Reset Password | Public (Token Required) |
| `GET` | `/api/user` | Get Current User | Protected |
| `POST` | `/api/auth/logout` | User Logout | Protected |

### **6.2 School Configuration**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/school/config` | Get School Configuration | Protected |
| `PUT` | `/api/school/config` | Update School Configuration | Admin Only |
| `GET` | `/api/school/sessions` | List Academic Sessions | Protected |
| `POST` | `/api/school/sessions` | Create Session | Admin Only |
| `GET` | `/api/school/terms` | List Terms | Protected |
| `POST` | `/api/school/terms` | Create Term | Admin Only |
| `GET` | `/api/school/grade-levels` | List Grade Levels | Protected |
| `POST` | `/api/school/grade-levels` | Create Grade Level | Admin Only |
| `GET` | `/api/school/subjects` | List Subjects | Protected |
| `POST` | `/api/school/subjects` | Create Subject | Admin Only |

### **6.3 Exams**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/exams` | List Exams | Protected |
| `POST` | `/api/exams` | Create Exam | Teacher/Admin Only |
| `GET` | `/api/exams/{id}` | Get Exam Details | Protected |
| `PUT` | `/api/exams/{id}` | Update Exam | Teacher/Admin Only |
| `DELETE` | `/api/exams/{id}` | Delete Exam | Admin Only |
| `POST` | `/api/exams/{id}/start` | Start Exam Session | Student Only |
| `POST` | `/api/exams/{id}/submit` | Submit Exam | Student Only |
| `GET` | `/api/exams/{id}/submissions` | View Submissions | Teacher/Admin Only |
| `PUT` | `/api/exams/{id}/submissions/{submission_id}/grade` | Grade Submission | Teacher Only |

### **6.4 Events**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | List Events | Protected |
| `POST` | `/api/events` | Create Event | Admin Only |
| `PUT` | `/api/events/{id}` | Update Event | Admin Only |
| `DELETE` | `/api/events/{id}` | Delete Event | Admin Only |
| `POST` | `/api/events/{id}/rsvp` | RSVP to Event | Protected |

### **6.5 Results**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/results/my-results` | Get Student's Results | Student Only |
| `GET` | `/api/results/students/{id}` | Get Student Results | Teacher/Admin Only |
| `POST` | `/api/results/input` | Input Scores | Teacher Only |
| `GET` | `/api/results/report-cards/{id}` | Download Report Card | Protected |
| `POST` | `/api/results/check` | Public Result Check (PIN) | Public |
| `POST` | `/api/results/pins` | Generate Result Pins | Admin Only |

### **6.6 Invitations**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/invites` | List Invite Codes | Admin Only |
| `POST` | `/api/invites/generate` | Generate Invite Code | Admin Only |
| `DELETE` | `/api/invites/{id}` | Delete Invite Code | Admin Only |
| `POST` | `/api/invites/{id}/regenerate` | Regenerate Code | Admin Only |

---

## **7. Security & Compliance**

### **7.1 Access Control Matrix**
| Feature | Student | Teacher | Admin |
| :--- | :---: | :---: | :---: |
| **View Dashboard** | ✅ | ✅ | ✅ |
| **Join Class (Invite)** | ✅ | ❌ | ❌ |
| **Create Lecture** | ❌ | ✅ | ✅ |
| **Create Exam** | ❌ | ✅ | ✅ |
| **Grade Exam** | ❌ | ✅ | ✅ |
| **View All Results** | ❌ (Own Only) | ✅ (Own Classes) | ✅ |
| **Generate Invites** | ❌ | ❌ | ✅ |
| **Configure School** | ❌ | ❌ | ✅ |
| **Create Events** | ❌ | ❌ | ✅ |
| **View Events** | ✅ (Based on Visibility) | ✅ (Based on Visibility) | ✅ |

### **7.2 Data Protection**
*   **Encryption:** All passwords hashed (Bcrypt/Argon2id). Sensitive data encrypted at rest.
*   **Transport:** HTTPS enforced in production.
*   **Input Validation:** Sanitization on both Client (UX) and Server (Security).
*   **File Uploads:** Virus scanning, MIME type validation, size limits.
*   **Exam Security:** Session locking, timer enforcement, upload validation.

---

## **8. Deployment Strategy**

### **8.1 Environment Variables**
```bash
APP_NAME=vDeskconnect
APP_URL=https://vdeskconnect.com
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=vdeskconnect
DB_USERNAME=postgres
DB_PASSWORD=<<Secure_Password>>

JWT_SECRET=<<Secure_Random_String>>
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,vdeskconnect.com

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<<SMTP_User>>
MAIL_PASSWORD=<<SMTP_Pass>>

AWS_BUCKET=vdeskconnect-files
AWS_ACCESS_KEY_ID=<<AWS_Key>>
AWS_SECRET_ACCESS_KEY=<<AWS_Secret>>
AWS_DEFAULT_REGION=us-east-1
```

### **8.2 CI/CD Pipeline**
1.  **Build:** Docker image creation for Laravel & Next.js.
2.  **Test:** Run PHPUnit (Backend) and Jest/Vitest (Frontend) tests.
3.  **Migrate:** Run `php artisan migrate --force` on deployment.
4.  **Seed:** Run `php artisan db:seed` for default configurations.
5.  **Deploy:** Push to production server (VPS or Cloud).

---

## **9. Answers to Your Specific Questions**

### **Q1: Does my current model include an exam model?**
**Answer:** ❌ **No.** Your v1.0 model (Express/React) does **not** include:
*   Exam sessions
*   Question banks (MCQ/Theory)
*   Student submissions
*   Grading workflows
*   Result checking

**v3.0 Solution:** Complete **Exam Engine Module** added (Section 4.2).

### **Q2: Does my current model include events?**
**Answer:** ❌ **No.** Your v1.0 model does **not** include:
*   School calendar
*   Event visibility rules
*   RSVP tracking

**v3.0 Solution:** Complete **Events Module** added (Section 4.3).

### **Q3: Is there a result checking section?**
**Answer:** ❌ **No.** Your v1.0 model does **not** include:
*   Grade books
*   Report cards
*   Result checking PINs

**v3.0 Solution:** Complete **Results Module** added (Section 4.4).

### **Q4: Can an admin build classes, name them, add subjects, etc.?**
**Answer:** ❌ **Not in v1.0.** Your v1.0 model has hardcoded tables (`Junior`, `Senior`, `JSScheme`, `SSScheme`).

**v3.0 Solution:** ✅ **Yes.** Admins can:
*   Create unlimited grade levels (JSS1, 6ème, Grade 6, etc.)
*   Name them anything
*   Create subjects per school
*   Define terms (3 terms, 2 semesters, 3 trimesters)
*   Configure grading scales (A-F, 1-10, Percentages)
*   All via **Admin Dashboard** (No code changes needed)

### **Q5: Can students upload PNG/JPG for theory exams?**
**Answer:** ✅ **Yes (v3.0).** The `exam_answers` table includes:
*   `answer_text` (for typed responses)
*   `file_url` (for PNG, JPG, PDF uploads)
*   File validation on upload (MIME type, size limits)

---

## **10. Migration Path (v1.0 → v3.0)**

### **Phase 1: Database Migration (Week 1-2)**
1.  Create new PostgreSQL database with v3.0 schema.
2.  Write Laravel migrations for all tables.
3.  Create seeder for default school configurations.
4.  **Do NOT migrate old data** (v1.0 schema is incompatible).

### **Phase 2: Backend Development (Week 3-6)**
1.  Set up Laravel 11 project.
2.  Implement Authentication (Sanctum).
3.  Build School Configuration APIs.
4.  Build Exam Engine APIs.
5.  Build Events APIs.
6.  Build Results APIs.

### **Phase 3: Frontend Development (Week 7-12)**
1.  Set up Next.js 14 project.
2.  Build Admin Dashboard (School Config, Users, Exams).
3.  Build Teacher Dashboard (Lectures, Exams, Grading).
4.  Build Student Dashboard (Classes, Exams, Results).
5.  Build Public Result Checking Portal.

### **Phase 4: Testing & Deployment (Week 13-14)**
1.  Unit Testing (PHPUnit, Vitest).
2.  Integration Testing (API endpoints).
3.  Security Audit (Penetration testing).
4.  Deploy to production.

---

## **11. Conclusion**

This **v3.0 Architecture Document** transforms vDeskconnect from a **Nigerian-specific school app** into a **global, multi-tenant SaaS platform** that can serve:
*   🇳🇬 Nigerian Schools (JSS/SSS, Terms)
*   🇧🇯 Benin Schools (Collège/Lycée, Trimestres, Séries)
*   🇫🇷 French Schools (6ème-Terminale, Semesters)
*   🇺🇸 American Schools (Grade 1-12, Semesters, GPA)
*   🌍 **Any Country** (Configurable via Admin Dashboard)

**Key Achievements:**
1.  ✅ **100% Customizable** - Admins configure everything without code.
2.  ✅ **Exam Engine** - MCQ + Theory + File Upload (PNG, JPG, PDF).
3.  ✅ **Events Calendar** - Role-based visibility.
4.  ✅ **Result Management** - Grade books, report cards, PIN checking.
5.  ✅ **Multi-Tenant** - Single codebase, unlimited schools.

**Your app is now ready to be rebuilt!** 🚀