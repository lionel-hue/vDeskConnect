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
1.  **Multi-Country Support:** Admins configure terms, grades, subjects, and grading scales without code changes. Classes can include departments with customizable departmental-specific subjects.
2.  **Exam Engine:** Timed exams with MCQ, Theory, and File Upload (PNG, JPG, PDF) support.
3.  **Events Calendar:** School-wide events with role-based visibility.
4.  **Result Management:** Grade books, report cards, and secure result checking portals.
5.  **Notices & Syllabus:** School-wide announcements and curriculum tracking.
6.  **Timetables (Routine):** Automated scheduling for classes and exams.
7.  **Promotion & Fees:** Managed student progression and school fee tracking.
8.  **Staff & Library:** Complete personnel and resource management.
9.  **Invitation System:** Secure student/teacher onboarding via invitation codes.
10. **AI Builder Suite:** Assisted creation of Schemes of Work, Lesson Notes, and Exams using static tool interfaces.
11. **Tiered Subscriptions:** 14-day free trial with monthly plans that accumulate duration; 'Hidden Forever & All Unlocked' plan for platform owner.
12. **Marketplace:** In-app store for electronic textbooks and literature.
13. **Lecture Builder:** Multi-media lecture assembly with video conferencing integration.
14. **Living UI Illustration System:** Dynamic, table-driven illustration packs that can be swapped by Super Admins to keep the app feeling fresh and alive.

---

## **1.4 UI Design Philosophy**

### **1.4.1 Design Principles**
| Principle | Description |
| :--- | :--- |
| **Fluid & Modern** | Clean, minimal UI elements with soft rounded corners, generous whitespace, and smooth transitions. |
| **Highly Interactive** | Subtle hover effects, micro-animations, and satisfying state transitions — never overwhelming, always purposeful. |
| **Illustration-Driven** | Every key screen (login, signup, dashboards, empty states) features contextual illustrations that make the app feel alive and welcoming. |
| **Dynamic Illustrations** | Illustrations are stored as managed assets via a database-driven system. Super Admins can upload "illustration packs" that instantly refresh the look of the entire app without code deployments. |
| **Inspired by Design Reference** | The `ui_design.png` in `model/` serves as the primary visual reference: soft purple/lavender palette, rounded card UI, dark sidebar with icon navigation, clean typography, data widgets, and calendar integration. |

### **1.4.2 Living UI Illustration System**

**Problem:** Static illustration assets become stale over time. Replacing them requires code changes and redeployment.

**Solution:** A **database-driven illustration management system** where:

1.  **`ui_illustrations` Table** stores metadata for every illustration used across the app.
2.  **Illustration Packs** are groups of images uploaded together and applied as a set.
3.  **Super Admin Dashboard** provides a UI to upload new packs, preview them, and activate them with one click.
4.  **Frontend** fetches the active illustration URLs from the API and renders them dynamically.

#### **How It Works**

```
┌─────────────────────────────────────────────────────────────┐
│  Super Admin uploads "Illustration Pack v2"                 │
│  ├── login_hero.svg                                         │
│  ├── signup_step1.svg                                       │
│  ├── signup_step2.svg                                       │
│  ├── signup_step3.svg                                       │
│  ├── dashboard_empty.svg                                    │
│  ├── no_results.svg                                         │
│  └── error_404.svg                                          │
│                                                             │
│  Admin activates the pack → sets "is_active" = true         │
│  Previous pack → sets "is_active" = false                   │
│                                                             │
│  Frontend calls GET /api/ui/illustrations                   │
│  Returns: { "login_hero": "/storage/illustrations/...", ...}│
│                                                             │
│  React components render images from API response           │
└─────────────────────────────────────────────────────────────┘
```

#### **Database Table: `ui_illustrations`**

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | BigInt | Primary key |
| `pack_name` | String | Name of the illustration pack (e.g., "Fresh Start 2026") |
| `key` | String | Identifier used in code (e.g., `login_hero`, `signup_welcome`) |
| `url` | String | Public storage URL to the image file |
| `section` | String | App section where used (login, signup, dashboard, errors, empty_states) |
| `is_active` | Boolean | Whether this illustration is currently live |
| `created_by` | FK → users | Super Admin who uploaded it |
| `created_at` | Timestamp | Upload timestamp |

**Uniqueness:** `(key, is_active)` — only one active illustration per key at any time.

#### **Storage Strategy**
- Illustrations are stored in Laravel's `storage/app/public/illustrations/` directory.
- They are symlinked to `public/storage/illustrations/` via `php artisan storage:link`.
- File naming follows the convention: `{pack_name}/{key}.{ext}` (e.g., `fresh_start_2026/login_hero.svg`).
- Supported formats: SVG (preferred for scalability), PNG, WebP.

#### **API Endpoints**

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ui/illustrations` | Get all active illustrations | Public |
| `GET` | `/api/ui/illustrations/active/{section}` | Get active illustrations for a section | Public |
| `POST` | `/api/ui/illustrations/packs` | Upload a new illustration pack | Super Admin |
| `PUT` | `/api/ui/illustrations/packs/{id}/activate` | Activate a pack | Super Admin |
| `GET` | `/api/ui/illustrations/packs` | List all uploaded packs | Super Admin |
| `DELETE` | `/api/ui/illustrations/packs/{id}` | Delete a pack | Super Admin |

#### **Frontend Integration**
```jsx
// Illustrations are fetched once at app boot and cached in React Context
const { illustrations } = useIllustrations();

// Usage in any component
<img
  src={illustrations.login_hero}
  alt="Welcome to vDeskconnect"
  className="illustration-fade-in"
/>
```

#### **Animation Guidelines**
| Animation | Duration | Easing | Usage |
| :--- | :--- | :--- | :--- |
| **Fade In** | 400ms | ease-out | Page load, illustration transitions |
| **Slide Up** | 300ms | ease-out | Cards appearing, form steps |
| **Scale Pulse** | 200ms | ease-in-out | Button hover, icon hover |
| **Smooth Transition** | 250ms | ease | All interactive state changes |

### **1.4.3 Color Palette (Inspired by ui_design.png)**

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `primary` | `#7C6BC4` | Primary actions, active states, brand |
| `primary-light` | `#A99DDB` | Hover states, secondary accents |
| `primary-dark` | `#5E4FA2` | Pressed states, emphasis |
| `bg-main` | `#F0EEF7` | Main app background |
| `bg-card` | `#FFFFFF` | Card backgrounds |
| `sidebar` | `#1A1A2E` | Dark sidebar |
| `text-primary` | `#2D2B55` | Primary text |
| `text-secondary` | `#6B6B8D` | Secondary text, labels |
| `text-muted` | `#9B9BB4` | Disabled, placeholders |
| `border` | `#E5E4F0` | Borders, dividers |
| `success` | `#34D399` | Success states |
| `warning` | `#FBBF24` | Warning states |
| `error` | `#EF4444` | Error states |
| `info` | `#60A5FA` | Info states |

### **1.4.4 Component Styling Conventions**
- **Border Radius:** `12px` (cards), `16px` (large panels), `8px` (buttons/inputs), `24px` (hero panels)
- **Shadows:** Soft, diffused shadows — `0 4px 24px rgba(124, 107, 196, 0.08)`
- **Typography:** System font stack with clean, readable sizing hierarchy
- **Spacing:** 8px base unit (8, 16, 24, 32, 48, 64)
- **Transitions:** All interactive elements have `transition-all duration-250 ease`

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

### **2.3 User Roles & Hierarchy**
1.  **Super Admin (Service Provider):** Platform owner holding a "hidden forever & all unlocked" plan. Cannot view private school data, sees only advanced charts, widgets, activity statistics, and basic school bio-data.
2.  **School Admin (Director):** Configures the school and starts with an automatic 14-day free trial. Purchases monthly plans (3-4 tiers). Plan durations accumulate with remaining trial days. Has full authority to create principals and admin staff, and can ban or delete (with email reason sent) anyone below them.
3.  **Principal:** Performs most administrative duties but cannot handle financial reports or create other admin staff (only the Admin handles this).
4.  **Admin Staff / Receptionist:** Staff ranked above teachers. The **Receptionist** receives school fees, publishes payment/salary announcements, emails parents, manages the textbook marketplace, and feeds financial reports directly to the School Admin. Admin Staff can create teacher/student accounts and ban users below them.
5.  **Teacher:** Academic role. Excluded from taking exams.
6.  **Student:** Learner role. Excluded from taking exams (only allowed to take them as test subjects). *Note: Teachers and Admin Staff are never allowed to write exams.*
*Note: Public account creation is disabled. The Admin/Staff must create users, and every user must change their password on their first login.*

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
| **sections** | `id`, `school_id`, `grade_level_id`, `name` (A, B, Yellow), `room_number` | Class subdivisions/classrooms. |
| **departments** | `id`, `school_id`, `name` (Science, Série C), `code` | Admin-defined streams/departments. |
| **courses** | `id`, `school_id`, `name`, `code`, `grade_level_id`, `type` (core, elective) | Specific academic courses (Academic Setting). |
| **subjects** | `id`, `school_id`, `name`, `code`, `department_id` (nullable) | Admin-defined subjects. |
| **teacher_subjects** | `id`, `school_id`, `teacher_id`, `subject_id`, `grade_level_id`, `section_id` (nullable) | Which teacher teaches what. |

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

#### **J. Communication & Logistics** ⭐ **NEW**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **notices** | `id`, `school_id`, `title`, `content`, `visibility`, `created_by` | Official school announcements. |
| **syllabuses** | `id`, `school_id`, `course_id`, `grade_level_id`, `file_url`, `version` | Subject/Course curriculum. |
| **routines** | `id`, `school_id`, `class_id`, `section_id`, `subject_id`, `day`, `start_time`, `end_time` | Timetable/Routine. |
| **promotions** | `id`, `school_id`, `student_id`, `from_grade_id`, `to_grade_id`, `session_id` | Student tracking of year-to-year progress. |

#### **K. Admin & Finance** ⭐ **NEW**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **staff** | `id`, `school_id`, `user_id`, `designation`, `department`, `salary`, `joined_date` | Non-teaching staff management. |
| **fee_structures** | `id`, `school_id`, `grade_level_id`, `name`, `amount`, `due_date` | Fee definitions. |
| **payments** | `id`, `school_id`, `student_id`, `fee_id`, `amount_paid`, `method`, `status`, `reference` | Transaction history. |
| **library_books** | `id`, `school_id`, `title`, `author`, `isbn`, `quantity`, `available` | Book inventory. |
| **library_loans** | `id`, `school_id`, `book_id`, `user_id`, `borrowed_at`, `due_at`, `returned_at` | Borrowing records. |

#### **L. Subscriptions & Marketplace** ⭐ **NEW**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **subscriptions** | `id`, `school_id`, `plan_id`, `starts_at`, `expires_at`, `status` | Manages 14-day trials and accumulative plans. |
| **textbooks** | `id`, `school_id`, `title`, `grade_level_id`, `price`, `file_url` | Electronic books for Receptionist market. |
| **marketplace_orders** | `id`, `student_id`, `textbook_id`, `amount`, `status`, `payment_ref` | Sales tracking for student purchases. |
| **user_bans** | `id`, `user_id`, `banned_by`, `reason` | Record of bans and deletions. |

#### **M. UI Illustrations System** ⭐ **NEW**
| Table | Columns | Description |
| :--- | :--- | :--- |
| **ui_illustrations** | `id`, `pack_name`, `key`, `url`, `section`, `is_active`, `created_by` | Dynamic illustration assets managed by Super Admin. |

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
1. Teacher Creates Exam (Manual or AI-Generated)
   ├── Set Title, Subject, Grade Level
   ├── Set Duration (e.g., 60 minutes)
   ├── Set Start/End Time Window
   ├── Add Questions Manually OR
   └── Use AI Exam Generator: Utilize static tools (dropdowns/checkboxes) to select weeks, topics, mark allocation, and criteria. The school AI supplies OBJ and Theory questions, supporting multiple generated variants!

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

298: "F": { "min": 0, "max": 39, "remark": "Fail" }
299: }
300: ```

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

### **4.6 Notices & Syllabus Module** ⭐ **NEW**

#### **4.6.1 School Notices**
*   **Create:** Admins create notices with title, content, and visibility (Public, Students, Staff).
*   **Expiration:** Notices can have an optional expiration date.
*   **Attachments:** Support for attaching PDF/Images to notices.

#### **4.6.2 Syllabus Management**
*   **Upload:** Teachers/Admins upload course syllabuses per grade level and subject.
*   **Tracking:** Students can view the syllabus to track their learning progress.

---

### **4.7 Routine & Timetable Module** ⭐ **NEW**

#### **4.7.1 Class Routines**
*   **Generation:** Admin or Admin Staff can explicitly build tables, or rely on the system to generate them dynamically based on the periods specified.
*   **Scheduling:** Weekly timetable showing subjects, teachers, and time slots.
*   **Sections:** Different routines for different sections (e.g., JSS1-A vs JSS1-B).
*   **Conflict Detection:** (Future) System warns if a teacher is double-booked.

---

### **4.8 Promotion & Result Management**

#### **4.8.1 Student Promotion**
*   **End of Year:** Process to move students from one grade level to the next.
*   **Criteria:** Based on result performance or manual selection.
*   **History:** Maintain record of which grade levels a student has passed through.

---

### **4.9 Admin & Logistics Module** ⭐ **NEW**

#### **4.9.1 Staff Management**
*   **Centralized Database:** Record of all non-teaching staff (Bursar, Librarian, Drivers, etc.).
*   **Payroll Link:** (Future) Integration with salary and payment records.

#### **4.9.2 Library Management**
*   **Inventory:** Track available books, authors, and quantities.
*   **Issue/Return:** Manage book loans to students and staff.
*   **Due Dates:** Automated tracking of overdue books.

#### **4.9.3 Fee & Payment Processing**
*   **Stuctures:** Define fees per grade level (Tuition, Uniform, Books).
*   **Online Payments:** Integration with payment gateways (Paystack/Flutterwave).
*   **Manual Entry:** Bursars can record offline cash/bank payments.
*   **Receipts:** Auto-generated PDF receipts for every transaction.

#### **4.9.4 Textbook Marketplace**
*   **Digital Store:** The Receptionist manages a marketplace containing electronic books and literature based on grade level needs.
*   **Purchasing:** Students can purchase necessary texts directly through the app.
*   **Analytics:** All financial records are tracked so the Admin can analyze them.

---

### **4.10 AI-Driven Builder Modules** ⭐ **NEW**

#### **4.10.1 Scheme of Work & Lesson Note Builders**
*   **Static Tools Approach:** Admins and teachers use static UI tools (not raw language prompts) to carefully select weeks, topics, and aspects.
*   **AI Engine:** The school's assigned AI model generates the Scheme of Work or Lesson Note based on these hardcore configurations, which the user then validates and publishes.

#### **4.10.2 Lecture Builder**
*   **Multi-Media Assembly:** Teachers generate a lecture walkthrough manually or with AI, specifying for how many students.
*   **Attachments:** Embed PDF documents and Video links seamlessly using the builder.
*   **Video Conferencing:** If a lecture involves a live conference, it runs outside the app, but the teacher will still mark the lecture as complete inside the platform.

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
subscription_id → school_id, plan_id, starts_at, expires_at, status
textbook_id   → school_id, title, grade_level_id, price, file_url
order_id      → student_id, textbook_id, amount, status, payment_ref
user_ban_id   → user_id, banned_by, reason
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
subscription_id → #school_id
textbook_id   → #school_id, #grade_level_id
order_id      → #student_id, #textbook_id
user_ban_id   → #user_id, #banned_by
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

### **6.7 Academic & Logistics (New)**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET/POST` | `/api/notices` | Manage School Notices | Protected/Admin |
| `GET/POST` | `/api/syllabus` | Manage Course Syllabus | Protected/Admin |
| `GET/POST` | `/api/routines` | Manage Timetables | Protected/Admin |
| `POST` | `/api/promotions` | Bulk Student Promotion | Admin Only |
| `GET/POST` | `/api/payments` | Fee Collection & History | Admin/Student |
| `GET/POST` | `/api/staff` | Manage General Staff | Admin Only |
| `GET/POST` | `/api/library` | Library Inventory & Loans | Protected/Admin |
| `GET/POST` | `/api/academic/sections` | Manage Class Sections | Admin Only |
| `GET/POST` | `/api/academic/courses` | Manage School Courses | Admin Only |

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
