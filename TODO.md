# vDeskConnect — Comprehensive Implementation Plan

## Overview
This document outlines the complete implementation roadmap for building the **Academic Management System**, **Classes & Grades**, **Lectures**, **Exams**, **Marketplace**, and all related modules as specified in the `model/architecture.md` file.

---

## Phase 1: Academic Session Configuration (Admin Core Foundation)

**Why First:** Everything else (grades, subjects, exams, schemes of work, lectures) depends on the academic session being configured. This is the foundation.

### 1.1 Academic Session Management
- [ ] **Backend**: Create `academic_sessions` table migration
  - Columns: `id`, `school_id`, `name` (e.g., "2025/2026"), `start_date`, `end_date`, `active`, timestamps
- [ ] **Backend**: Create `academic_terms` table migration
  - Columns: `id`, `school_id`, `session_id` (FK), `name` (e.g., "Term 1"), `start_date`, `end_date`, `order`, `weeks_count`, timestamps
- [ ] **Backend**: API endpoints for sessions
  - `GET /api/academic/sessions` — List all sessions
  - `POST /api/academic/sessions` — Create session (Admin only)
  - `PUT /api/academic/sessions/{id}` — Update session
  - `GET /api/academic/sessions/{id}/terms` — Get terms for a session
- [ ] **Backend**: API endpoints for terms
  - `GET /api/academic/terms` — List terms for current session
  - `POST /api/academic/terms` — Create term (Admin only)
  - `PUT /api/academic/terms/{id}` — Update term
  - `DELETE /api/academic/terms/{id}` — Delete term
- [ ] **Frontend**: Create `/dashboard/academic` page (NEW TAB — replace placeholder)
  - Sidebar nav item: "Academic" with `Settings` icon, route `/dashboard/academic`
  - Tab structure: Sessions, Terms, Grades, Subjects, CA Settings, Subjects-to-Grades Mapping
- [ ] **Frontend**: Session Card UI (inspired by sections_idea.png)
  - "Create Session" card with warning: "Create one Session per academic year."
  - Input: Session name (e.g., "2025 - 2026")
  - Button: Create
  - Display existing sessions list with active indicator
- [ ] **Frontend**: Term Configuration Card UI
  - Input: Number of terms (1, 2, or 3)
  - For each term: Name, Start Date, End Date, Weeks Count
  - Visual timeline showing term progression
  - Warning: "Do not change terms mid-session."

### 1.2 Continuous Assessment (CA) Week Configuration
- [ ] **Backend**: Create `ca_weeks` table migration
  - Columns: `id`, `school_id`, `term_id`, `grade_level_id`, `subject_id`, `week_number`, `is_test_week`, `is_exam_week`, timestamps
  - This defines which weeks have tests vs. which is the exam week
- [ ] **Backend**: API endpoints for CA weeks
  - `GET /api/academic/terms/{term}/ca-weeks` — Get CA week config
  - `POST /api/academic/ca-weeks` — Set CA week (Admin only)
  - `PUT /api/academic/ca-weeks/{id}` — Update CA week
  - `DELETE /api/academic/ca-weeks/{id}` — Remove CA week
- [ ] **Frontend**: CA Week Configuration UI (under Academic tab)
  - Select Grade Level dropdown
  - Select Subject dropdown
  - Week grid (e.g., Week 1–12): Each week has toggles:
    - ☐ Test Week (Continuous Assessment)
    - ☐ Exam Week (Final Exam)
  - Visual summary: "Tests at weeks 3, 6, 9 | Exam at week 12"
  - Save button

### 1.3 Grading Scale Configuration
- [ ] **Backend**: Create `grade_scales` table migration
  - Columns: `id`, `school_id`, `name` (e.g., "Nigerian WAEC"), `scale` (JSONB: `{ "A": {min: 70, max: 100, remark: "Excellent"} }`), `is_default`, timestamps
- [ ] **Backend**: API endpoints for grade scales
  - `GET /api/academic/grade-scales` — List all scales
  - `POST /api/academic/grade-scales` — Create scale
  - `PUT /api/academic/grade-scales/{id}` — Update scale
  - `PUT /api/academic/grade-scales/{id}/set-default` — Set as default
- [ ] **Frontend**: Grade Scale Builder UI (under Academic tab)
  - Preset templates: Nigerian WAEC, French Baccalaureat, American GPA, Custom
  - Custom builder: Add grade rows (Letter, Min %, Max %, Remark)
  - Preview table showing full scale
  - Save & Set as Default button

---

## Phase 2: Grade Levels & Class Structure

**Why Second:** Grades/classes are the backbone. Students are assigned to grades, teachers teach grades, exams are per grade.

### 2.1 Grade Levels (aka Classes/Grade Levels)
> **Clarification:** In the architecture, "grade levels" = academic year (JSS1, SS1, Grade 6, 6ème). "Classes" in the sidebar = managing these grade levels + their sections. "Lectures" = actual teaching sessions. They are DIFFERENT.

- [ ] **Backend**: Create `grade_levels` table migration
  - Columns: `id`, `school_id`, `name` (e.g., "JSS 1"), `short_name` (e.g., "JSS1"), `order`, `cycle` (e.g., "Junior", "Senior", nullable), timestamps
- [ ] **Backend**: API endpoints for grade levels
  - `GET /api/academic/grade-levels` — List all grade levels
  - `POST /api/academic/grade-levels` — Create grade level
  - `PUT /api/academic/grade-levels/{id}` — Update grade level
  - `DELETE /api/academic/grade-levels/{id}` — Delete grade level
- [ ] **Frontend**: Grade Level Management UI (under Academic tab)
  - "Create Grade Level" card:
    - Input: Name (e.g., "JSS 1")
    - Input: Short Name (e.g., "JSS1")
    - Input: Order (number)
    - Dropdown: Cycle (Junior, Senior, Primary, etc.)
    - Create button
  - Table: Existing grade levels with edit/delete actions
  - Bulk create option: "Create JSS1–JSS3" quick action

### 2.2 Sections (Class Subdivisions)
- [ ] **Backend**: Create `sections` table migration
  - Columns: `id`, `school_id`, `grade_level_id` (FK), `name` (e.g., "A", "B", "Yellow"), `room_number`, `capacity`, timestamps
- [ ] **Backend**: API endpoints for sections
  - `GET /api/academic/grade-levels/{id}/sections` — List sections
  - `POST /api/academic/sections` — Create section
  - `PUT /api/academic/sections/{id}` — Update section
  - `DELETE /api/academic/sections/{id}` — Delete section
- [ ] **Frontend**: Section Management UI (under `/dashboard/classes`)
  - Per grade level: "Add Section" card
    - Input: Section Name (e.g., "A")
    - Input: Room Number
    - Input: Capacity (optional)
    - Dropdown: Assign to Grade Level
    - Save button
  - Sections displayed as cards under their parent grade level

### 2.3 Departments (Optional Streams)
- [ ] **Backend**: Create `departments` table migration
  - Columns: `id`, `school_id`, `name` (e.g., "Science", "Arts", "Série C"), `code`, timestamps
- [ ] **Backend**: API endpoints for departments
  - `GET /api/academic/departments` — List departments
  - `POST /api/academic/departments` — Create department
  - `PUT /api/academic/departments/{id}` — Update department
  - `DELETE /api/academic/departments/{id}` — Delete department
- [ ] **Frontend**: Department Management UI (under Academic tab)
  - "Create Department" card
  - Table of existing departments
  - Note: Departments are optional, used for senior secondary streams

---

## Phase 3: Subjects & Subject-to-Grade Mapping

**Why Third:** Subjects are needed before schemes of work, lesson notes, exams, and lectures can exist.

### 3.1 Subject Catalog
- [ ] **Backend**: Create `subjects` table migration
  - Columns: `id`, `school_id`, `name` (e.g., "Mathematics"), `code` (e.g., "MTH"), `department_id` (FK, nullable), `type` (core, elective, departmental), timestamps
- [ ] **Backend**: API endpoints for subjects
  - `GET /api/academic/subjects` — List all subjects
  - `POST /api/academic/subjects` — Create subject
  - `PUT /api/academic/subjects/{id}` — Update subject
  - `DELETE /api/academic/subjects/{id}` — Delete subject
- [ ] **Frontend**: Subject Management UI (under Academic tab)
  - "Create Subject" card:
    - Input: Name
    - Input: Code
    - Dropdown: Type (Core, Elective, Departmental)
    - Dropdown: Department (optional, for departmental subjects)
    - Create button
  - Table: All subjects with filters (Core, Elective, Departmental)

### 3.2 Subject-to-Grade-Level Mapping
- [ ] **Backend**: Create `grade_level_subjects` table migration
  - Columns: `id`, `school_id`, `grade_level_id` (FK), `subject_id` (FK), `is_compulsory`, `department_id` (FK, nullable), timestamps
  - Unique constraint: `(grade_level_id, subject_id)`
- [ ] **Backend**: API endpoints for subject mapping
  - `GET /api/academic/grade-levels/{id}/subjects` — Get subjects for a grade
  - `POST /api/academic/grade-level-subjects` — Assign subject to grade
  - `DELETE /api/academic/grade-level-subjects/{id}` — Remove subject from grade
  - `POST /api/academic/grade-level-subjects/bulk-assign` — Bulk assign subjects to multiple grades
- [ ] **Frontend**: Subject-to-Grade Mapping UI (under Academic tab)
  - Multi-step wizard:
    1. Select Grade Level(s) — multi-select (e.g., JSS1, JSS2, JSS3)
    2. Select Subject(s) — multi-select with checkboxes
    3. Toggle: Is Compulsory?
    4. Assign (optional): Department filter
    5. Review & Save
  - Visual matrix: Grades × Subjects grid showing assignments
  - Quick presets: "Junior Subjects (JSS1–3)", "Senior Core (SS1–3)", "Science Dept (SS1–3)", "Arts Dept (SS1–3)"
  - Bulk operations: "Apply to all junior grades", "Apply to all senior grades"

---

## Phase 4: Classes Page (Full Implementation)

**Why Fourth:** Now that grades, sections, departments, and subjects exist, we build the full Classes management page.

### 4.1 Classes Page Redesign (`/dashboard/classes`)
- [ ] **Frontend**: Replace placeholder with full Classes page
  - View: Grid of all grade levels as cards
  - Each card shows:
    - Grade name, short name, cycle
    - Number of sections
    - Number of students enrolled
    - Assigned teacher(s)
    - Subjects offered
  - Actions: View Details, Edit, Delete
  - "Add Grade Level" button
- [ ] **Frontend**: Grade Level Detail View
  - Tabs: Overview, Sections, Subjects, Students, Teachers, Scheme of Work, Timetable
  - Overview: Stats (students count, sections count, subjects count)
  - Sections: List of sections with room numbers, capacities
  - Subjects: List of subjects assigned to this grade
  - Students: Table of students in this grade (with search, filter)
  - Teachers: List of teachers assigned to this grade + their subjects

### 4.2 Teacher-to-Class-Subject Assignment
- [ ] **Backend**: Update `teacher_subjects` table (already in architecture)
  - Columns: `id`, `school_id`, `teacher_id`, `subject_id`, `grade_level_id`, `section_id` (nullable), timestamps
  - This defines: "Teacher X teaches Subject Y in Grade Z (and optionally Section A)"
- [ ] **Backend**: API endpoints
  - `GET /api/teachers/{id}/subjects` — Get teacher's subjects
  - `POST /api/academic/teacher-subjects` — Assign teacher to subject+grade
  - `PUT /api/academic/teacher-subjects/{id}` — Update assignment
  - `DELETE /api/academic/teacher-subjects/{id}` — Remove assignment
  - `GET /api/academic/grade-levels/{id}/teachers` — Get teachers for a grade
- [ ] **Frontend**: Teacher Assignment UI (in Grade Detail view → Teachers tab)
  - "Assign Teacher" form:
    - Dropdown: Select Teacher
    - Dropdown: Select Subject (filtered to this grade's subjects)
    - Dropdown: Select Section (optional, or "All Sections")
    - Assign button
  - Table: Assigned teachers with their subjects and sections
  - Actions: Reassign, Remove

---

## Phase 5: Scheme of Work Builder

**Why Fifth:** Schemes of work are the curriculum backbone. Teachers need them before creating lesson notes or exams.

### 5.1 Scheme of Work Database & API
- [ ] **Backend**: Create `schemes_of_work` table migration
  - Columns: `id`, `school_id`, `subject_id` (FK), `grade_level_id` (FK), `term_id` (FK), `week_number`, `topic`, `aspects` (JSONB: `{ objectives, activities, resources, evaluation }`), `status` (draft, published), `created_by`, timestamps
- [ ] **Backend**: API endpoints
  - `GET /api/academic/schemes` — List schemes (filterable by grade, subject, term)
  - `POST /api/academic/schemes` — Create scheme entry
  - `PUT /api/academic/schemes/{id}` — Update scheme entry
  - `DELETE /api/academic/schemes/{id}` — Delete scheme entry
  - `POST /api/academic/schemes/bulk-create` — Bulk create all weeks for a subject+grade+term
  - `PUT /api/academic/schemes/{id}/publish` — Publish scheme
- [ ] **Backend**: AI Scheme Generator endpoint
  - `POST /api/ai/scheme-of-work` — Generate scheme using AI
  - Request body: `{ subject_id, grade_level_id, term_id, weeks: [1-12], topics: [], aspects: [] }`
  - Returns: Array of week entries with topics and aspects

### 5.2 Scheme of Work UI — Manual Entry
- [ ] **Frontend**: Create `/dashboard/classes/{id}/scheme-of-work` page
  - Accessed from Grade Detail view → Scheme of Work tab
  - Filters: Select Subject, Select Term
  - Week-by-week table:
    - Columns: Week #, Topic, Objectives, Activities, Resources, Evaluation, Actions
    - Each row is editable inline
    - "Add Week" button at bottom
  - Save Draft / Publish buttons
- [ ] **Frontend**: Week Entry Form (modal or inline)
  - Week Number (auto-incremented)
  - Topic (text input)
  - Aspects (collapsible sections):
    - Objectives (textarea)
    - Activities (textarea)
    - Resources (textarea)
    - Evaluation (textarea)
  - Save / Cancel

### 5.3 Scheme of Work UI — AI Builder
- [ ] **Frontend**: AI Scheme Builder Modal
  - Step 1: Select Subject (dropdown, pre-filtered to grade's subjects)
  - Step 2: Select Term (dropdown)
  - Step 3: Select Weeks (range selector: Week 1–12)
  - Step 4: Select Topics (multi-select from curriculum database or free-text)
  - Step 5: Select Aspects (checkboxes: Objectives, Activities, Resources, Evaluation)
  - Step 6: Generate button
  - Loading state: "AI is generating your Scheme of Work..."
  - Result: Pre-filled week table — teacher reviews, edits, validates
  - Actions: Edit individual weeks, Regenerate week, Approve All & Publish

---

## Phase 6: Lesson Notes Builder

**Why Sixth:** Lesson notes are created by teachers based on the scheme of work.

### 6.1 Lesson Notes Database & API
- [ ] **Backend**: Create `lesson_notes` table migration
  - Columns: `id`, `school_id`, `scheme_id` (FK to schemes_of_work), `teacher_id`, `grade_level_id`, `subject_id`, `term_id`, `week_number`, `topic`, `aspect` (JSONB: `{ objective, content, methodology, evaluation, materials }`), `contact_number` (duration in minutes), `status` (draft, published), timestamps
- [ ] **Backend**: API endpoints
  - `GET /api/academic/lesson-notes` — List notes (filterable by teacher, grade, subject, term)
  - `POST /api/academic/lesson-notes` — Create note
  - `PUT /api/academic/lesson-notes/{id}` — Update note
  - `DELETE /api/academic/lesson-notes/{id}` — Delete note
  - `PUT /api/academic/lesson-notes/{id}/publish` — Publish note
- [ ] **Backend**: AI Lesson Note Generator endpoint
  - `POST /api/ai/lesson-note` — Generate lesson note
  - Request body: `{ scheme_id, aspects: ['objective', 'content', 'methodology'], target_audience_size }`
  - Returns: Complete lesson note with all selected aspects

### 6.2 Lesson Notes UI — Manual Entry
- [ ] **Frontend**: Create `/dashboard/lesson-notes` page (Teacher-focused)
  - List view: All lesson notes (filterable by term, subject, grade, status)
  - Each note card shows: Week #, Topic, Subject, Grade, Status (Draft/Published), Last Updated
  - "Create New Note" button
- [ ] **Frontend**: Lesson Note Editor
  - Link to Scheme of Work: Dropdown to select scheme entry (auto-populates week, topic, subject, grade)
  - Sections (collapsible):
    - Objective (textarea)
    - Content (rich text editor or textarea)
    - Methodology (textarea)
    - Materials/Resources (textarea)
    - Evaluation (textarea)
    - Duration (number input, minutes)
  - Save Draft / Publish buttons
  - Preview mode

### 6.3 Lesson Notes UI — AI Builder
- [ ] **Frontend**: AI Lesson Note Builder Modal
  - Step 1: Select Scheme of Work entry (dropdown: "Week 3 — Algebra — JSS1 — Term 1")
  - Step 2: Auto-populated: Week, Topic, Subject, Grade
  - Step 3: Select Aspects to Generate (checkboxes: Objective, Content, Methodology, Evaluation, Materials)
  - Step 4: Target Audience Size (number input)
  - Step 5: Generate button
  - Result: Pre-filled lesson note — teacher reviews, edits, publishes
  - Actions: Edit sections, Regenerate section, Approve & Publish

---

## Phase 7: Lectures (Live & Async Teaching Sessions)

**Why Seventh:** Lectures are the actual teaching sessions, linked to teachers, grades, subjects, and optionally video conferences.

### 7.1 Lectures Database & API
- [ ] **Backend**: Create `lectures` table migration
  - Columns: `id`, `school_id`, `teacher_id`, `grade_level_id`, `subject_id`, `section_id` (nullable), `scheduled_at` (datetime), `duration_minutes`, `status` (scheduled, in_progress, completed, cancelled), `meeting_link` (nullable, for video conferences), `title`, `description` (text), `is_online`, timestamps
- [ ] **Backend**: Create `lecture_resources` table migration (or use existing `resources` table)
  - Columns: `id`, `lecture_id` (FK), `type` (pdf, video, link, image), `url`, `title`, `uploaded_by`, timestamps
- [ ] **Backend**: API endpoints
  - `GET /api/lectures` — List lectures (filterable by teacher, grade, subject, date range)
  - `POST /api/lectures` — Create lecture
  - `PUT /api/lectures/{id}` — Update lecture
  - `DELETE /api/lectures/{id}` — Delete lecture
  - `PUT /api/lectures/{id}/start` — Mark as in progress
  - `PUT /api/lectures/{id}/complete` — Mark as completed
  - `GET /api/lectures/{id}/resources` — Get lecture resources
  - `POST /api/lectures/{id}/resources` — Upload resource
- [ ] **Backend**: Attendance tracking
  - `attendances` table (already in architecture): `id`, `school_id`, `lecture_id`, `student_id`, `status` (present, absent, late), `checked_at`
  - `POST /api/lectures/{id}/attendance` — Mark attendance
  - `GET /api/lectures/{id}/attendance` — Get attendance

### 7.2 Lectures UI — Manual Assembly
- [ ] **Frontend**: Create `/dashboard/lectures` page (Teacher-focused)
  - List view: All lectures (filterable by term, subject, grade, status)
  - Each lecture card shows: Title, Subject, Grade, Date/Time, Duration, Status, Meeting Link (if online)
  - "Create Lecture" button
- [ ] **Frontend**: Lecture Creator
  - Fields:
    - Title (text input)
    - Subject (dropdown, filtered to teacher's subjects)
    - Grade Level (dropdown)
    - Section (dropdown, optional)
    - Scheduled Date & Time (datetime picker)
    - Duration (number input, minutes)
    - Description (textarea)
    - Is Online? (toggle)
    - Meeting Link (URL input, shown if online)
    - Attachments: Upload PDFs, videos, images, or paste external links
  - Create & Schedule button

### 7.3 Lectures UI — AI Builder
- [ ] **Frontend**: AI Lecture Builder Modal
  - Step 1: Select Subject (dropdown)
  - Step 2: Select Topic (dropdown or text input, linked to scheme of work)
  - Step 3: Toggle: Generate Walkthrough via AI? (if yes, AI generates lecture content; if no, teacher writes manually)
  - Step 4: Target Student Count (number input)
  - Step 5: Attachments (upload PDFs, videos, or paste external video links)
  - Step 6: Video Conference Toggle (if on, show meeting link input)
  - Step 7: Generate & Assemble button
  - Result: Complete lecture draft — teacher reviews, edits, publishes

### 7.4 Lecture Detail View
- [ ] **Frontend**: `/dashboard/lectures/{id}` page
  - Tabs: Overview, Resources, Attendance
  - Overview: Title, subject, grade, date/time, duration, status, meeting link
  - Resources: List of uploaded files/links, upload new resource
  - Attendance: Table of students with present/absent/late toggles
  - Actions: Start Lecture, Mark Complete, Edit, Delete

---

## Phase 8: Exams & Assessments

**Why Eighth:** Exams depend on grades, subjects, terms, and CA week configuration.

### 8.1 Exams Database & API (already in architecture, confirm & implement)
- [ ] **Backend**: Confirm `exams` table migration exists
  - Columns: `id`, `school_id`, `subject_id`, `grade_level_id`, `term_id`, `title`, `type` (MCQ, Theory, Mixed), `duration_minutes`, `start_at`, `end_at`, `published`, `is_ca_test` (boolean — is this a CA test week exam?), `week_number` (nullable, links to CA week config), timestamps
- [ ] **Backend**: Confirm `exam_questions`, `exam_submissions`, `exam_answers` tables
- [ ] **Backend**: API endpoints for exams
  - `GET /api/exams` — List exams (filterable)
  - `POST /api/exams` — Create exam
  - `PUT /api/exams/{id}` — Update exam
  - `DELETE /api/exams/{id}` — Delete exam
  - `POST /api/exams/{id}/publish` — Publish exam
  - `POST /api/exams/{id}/questions` — Add question(s)
  - `GET /api/exams/{id}/submissions` — View submissions (teacher)
  - `POST /api/exams/{id}/start` — Start exam (student)
  - `POST /api/exams/{id}/submit` — Submit exam (student)
- [ ] **Backend**: CA Aggregation logic
  - `GET /api/academic/ca/{grade}/{subject}/aggregate` — Get CA score (sum of all CA test scores for this grade+subject+term)

### 8.2 Exam Creation UI — Manual
- [ ] **Frontend**: Create `/dashboard/exams` page (replace placeholder)
  - List view: All exams (filterable by term, subject, grade, type, status)
  - "Create Exam" button
- [ ] **Frontend**: Manual Exam Creator
  - Fields:
    - Title (text input)
    - Subject (dropdown)
    - Grade Level (dropdown)
    - Term (dropdown, auto-current term)
    - Type (radio: MCQ, Theory, Mixed)
    - Duration (number, minutes)
    - Start Date & Time (datetime picker)
    - End Date & Time (datetime picker)
    - Is CA Test? (toggle — if yes, select week number from CA config)
    - Total Marks (number)
  - After creation: Add Questions interface
    - MCQ: Question text, 4 options (A–D), correct answer selector, marks
    - Theory: Question text, marks, model answer (for grading reference)
    - Add Question / Add Multiple Questions
  - Save Draft / Publish button

### 8.3 Exam Creation UI — AI Builder
- [ ] **Frontend**: AI Exam Builder Modal
  - Step 1: Select Subject (dropdown)
  - Step 2: Select Grade Level (dropdown)
  - Step 3: Select Term (dropdown)
  - Step 4: Select Weeks (checkboxes: Week 1–12, or range)
  - Step 5: Select Topics (multi-select from scheme of work)
  - Step 6: Question Types (toggles: OBJ/MCQ, Theory, Mixed)
  - Step 7: Mark Allocation (number input per question type)
  - Step 8: Difficulty (selector: Easy, Medium, Hard)
  - Step 9: Number of Variants (number, e.g., 3 for Variant A/B/C)
  - Step 10: Duration (number, minutes)
  - Step 11: Generate button
  - Loading state: "AI is generating your exam..."
  - Result: Pre-filled exam with all questions — teacher reviews, edits, removes, validates
  - Actions: Edit question, Regenerate question, Approve All & Publish

### 8.4 Exam Taking UI (Student)
- [ ] **Frontend**: Student exam page (`/student/exams/{id}/take`)
  - Timer (countdown, auto-submit on expiry)
  - Question navigator (jump between questions)
  - MCQ: Click to select answer
  - Theory: Textarea for typed answer OR file upload (PNG, JPG, PDF)
  - Submit button (with confirmation modal)
  - Auto-save progress

### 8.5 Exam Grading UI (Teacher)
- [ ] **Frontend**: Teacher grading page (`/dashboard/exams/{id}/grade`)
  - List of submissions (student name, status: submitted/pending, auto-score for MCQ)
  - Click submission → Grading view:
    - MCQ: Auto-graded, review only
    - Theory: Student answer displayed, teacher inputs score, view model answer
  - Save Grade / Publish Results button

---

## Phase 9: Reports & Grades Section

**Why Ninth:** Reports aggregate everything — scores, grades, positions.

### 9.1 Student Grades & Report Cards
- [ ] **Backend**: Confirm `student_grades`, `report_cards`, `result_checks` tables
- [ ] **Backend**: Grade computation logic
  - `POST /api/academic/grades/compute` — Compute grades based on CA + Exam
  - Formula: `Total = CA_Aggregate + Exam_Score`
  - Position: Rank students within grade
  - Grade: Apply grade scale
  - Remark: From grade scale
- [ ] **Backend**: Report card generation
  - `POST /api/results/report-cards/generate` — Generate PDF report card
  - `GET /api/results/report-cards/{id}` — Download report card
- [ ] **Backend**: Result check pins
  - `POST /api/results/pins/generate` — Generate bulk pins
  - `POST /api/results/check` — Public result check (PIN + Student ID)
- [ ] **Frontend**: `/dashboard/reports` page (replace placeholder)
  - Filters: Term, Grade Level, Student
  - Grade Book view: Table of students × subjects, CA scores, Exam scores, Total, Grade, Position
  - "Generate Report Cards" button
  - "Generate Result Pins" button
  - Download individual report card (PDF)

---

## Phase 10: Marketplace (Textbook Store)

**Why Tenth:** Independent module, depends on grade levels and students.

### 10.1 Marketplace Database & API
- [ ] **Backend**: Create `textbooks` table migration
  - Columns: `id`, `school_id`, `title`, `grade_level_id` (FK), `subject_id` (FK, nullable), `price`, `file_url` (nullable — null if physical book only), `is_electronic` (boolean), `physical_form_url` (nullable — form URL for physical book purchase reference), `description`, `stock_count` (nullable), `available` (boolean), timestamps
- [ ] **Backend**: Create `marketplace_orders` table migration
  - Columns: `id`, `school_id`, `student_id` (FK), `textbook_id` (FK), `amount`, `status` (pending, paid, delivered, refunded), `payment_ref`, `order_date`, timestamps
- [ ] **Backend**: API endpoints
  - `GET /api/marketplace/books` — List all books (public for students, filtered by grade)
  - `POST /api/marketplace/books` — Add book (Receptionist/Admin only)
  - `PUT /api/marketplace/books/{id}` — Update book
  - `DELETE /api/marketplace/books/{id}` — Remove book
  - `POST /api/marketplace/orders` — Place order (student)
  - `GET /api/marketplace/orders` — List orders (Receptionist/Admin: all; Student: own)
  - `PUT /api/marketplace/orders/{id}/status` — Update order status (Receptionist/Admin)

### 10.2 Marketplace UI — Receptionist/Admin
- [ ] **Frontend**: Create `/dashboard/marketplace` page (Receptionist/Admin access)
  - Tabs: Books, Orders, Analytics
  - **Books tab:**
    - "Add Book" form:
      - Title, Grade Level (dropdown), Subject (optional dropdown)
      - Price, Stock Count
      - Toggle: Is Electronic?
        - If yes: Upload file (PDF) or paste download link
        - If no: Upload Physical Form (PDF) — reference form student uses to buy in person
      - Description (textarea)
      - Available (toggle)
      - Add Book button
    - Table: All books with status, edit/delete actions
  - **Orders tab:**
    - Table: All orders (student name, book, amount, status, date)
    - Filters: Status, Grade Level, Date range
    - Actions: Update status (Mark Paid, Mark Delivered, Refund)
  - **Analytics tab:**
    - Sales chart (monthly revenue)
    - Top-selling books
    - Outstanding orders

### 10.3 Marketplace UI — Student
- [ ] **Frontend**: Create `/student/marketplace` page
  - Grid of books available for student's grade level
  - Each book card: Title, Subject, Price, Is Electronic badge, Buy button
  - If electronic: Purchase → Payment → Download link
  - If physical: Purchase → Payment → Download reference form → "Take this form to the school office to collect your book"
  - Order history tab: All student's orders with status

---

## Phase 11: Student Management Updates

**Why Eleventh:** Students must be assigned to grade levels and sections.

### 11.1 Student-Grade-Section Linking
- [ ] **Backend**: Update `users` or create `student_enrollments` table
  - Columns: `id`, `school_id`, `student_id` (FK to users), `grade_level_id` (FK), `section_id` (FK, nullable), `session_id` (FK), `enrollment_date`, `status` (active, graduated, withdrawn), timestamps
- [ ] **Backend**: API endpoints
  - `GET /api/students/{id}/enrollments` — Get student's enrollment history
  - `POST /api/students/enroll` — Enroll student in grade+section
  - `PUT /api/students/enrollments/{id}` — Update enrollment (e.g., change section)
- [ ] **Frontend**: Update `/dashboard/students` page
  - Add fields to Add/Edit student modals:
    - Grade Level (dropdown, required)
    - Section (dropdown, optional)
    - Session (auto-current, dropdown)
  - Student detail view: Show enrollment info, change grade/section
  - Bulk enrollment: CSV upload with grade+section columns

---

## Phase 12: Teacher Management Updates

**Why Twelfth:** Teachers must be assigned subjects and grades.

### 12.1 Teacher-Subject-Grade Linking
- [ ] **Backend**: Confirm `teacher_subjects` table is migrated
- [ ] **Backend**: API endpoints (already in Phase 4)
- [ ] **Frontend**: Update `/dashboard/teachers` page
  - Add fields to Add/Edit teacher modals:
    - Subjects taught (multi-select dropdown)
    - Grade levels assigned (multi-select dropdown)
  - Teacher detail view: Show assigned subjects, grades, and sections
  - Bulk assignment tool

---

## Phase 13: Events Calendar

**Why Thirteenth:** Events are needed but less critical than academics.

### 13.1 Events Database & API
- [ ] **Backend**: Confirm `events`, `event_attendees` tables
- [ ] **Backend**: API endpoints
  - `GET /api/events` — List events (filtered by visibility)
  - `POST /api/events` — Create event
  - `PUT /api/events/{id}` — Update event
  - `DELETE /api/events/{id}` — Delete event
  - `POST /api/events/{id}/rsvp` — RSVP (student/teacher)
- [ ] **Frontend**: `/dashboard/events` page (replace placeholder)
  - Calendar view (monthly, weekly)
  - "Add Event" form:
    - Title, Description
    - Start Date & Time, End Date & Time
    - Location (optional)
    - Visibility (All, Students Only, Teachers Only, Admins Only, Specific Grades)
    - Event Type (Academic, Social, Administrative, Deadline)
    - Create button
  - Event cards on calendar with color coding by type
  - List view alternative

---

## Phase 14: Fees Management

**Why Fourteenth:** Fees are important but can wait until academics are functional.

### 14.1 Fees Database & API
- [ ] **Backend**: Confirm `fee_structures`, `payments` tables
- [ ] **Backend**: API endpoints
  - `GET /api/fees/structures` — List fee structures
  - `POST /api/fees/structures` — Create fee structure
  - `GET /api/fees/payments` — List payments
  - `POST /api/fees/payments` — Record payment
  - `GET /api/fees/outstanding` — Get outstanding balances
- [ ] **Frontend**: `/dashboard/fees` page (replace placeholder)
  - Tabs: Fee Structures, Payments, Outstanding Balances, Announcements
  - Fee Structures: Define fees per grade level
  - Payments: Record payments (student, amount, method, date)
  - Outstanding: Table of students with unpaid fees
  - Announcements: Publish fee reminders to students/parents

---

## Phase 15: Settings Page

**Why Fifteenth:** Settings configure the school's overall behavior.

### 15.1 School Settings UI
- [ ] **Frontend**: `/dashboard/settings` page (replace placeholder)
  - Tabs: School Profile, Academic Configuration, Grading, Localization, Branding
  - School Profile: Name, logo, address, contact info
  - Academic Configuration: Link to `/dashboard/academic`
  - Grading: Default grade scale, CA/Exam weight (e.g., CA 30%, Exam 70%)
  - Localization: Currency, timezone, date format
  - Branding: School colors, custom theme (optional)

---

## Phase 16: Sidebar & Navigation Updates

**Why Sixteenth:** Update navigation to reflect all new pages.

### 16.1 Updated Sidebar Navigation (School Admin)
- [ ] **Frontend**: Update `Sidebar.jsx` with new tab order:
  1. Dashboard → `/dashboard`
  2. Students → `/dashboard/students`
  3. Teachers → `/dashboard/teachers`
  4. Staff → `/dashboard/staff`
  5. Academic → `/dashboard/academic` (NEW — sessions, terms, grades, subjects, CA config)
  6. Classes → `/dashboard/classes` (FULLY BUILT — grade levels, sections, teachers, schemes)
  7. Lectures → `/dashboard/lectures` (NEW — teaching sessions)
  8. Exams → `/dashboard/exams` (FULLY BUILT — CA tests, exams, grading)
  9. Reports → `/dashboard/reports` (FULLY BUILT — grade book, report cards, pins)
  10. Events → `/dashboard/events` (FULLY BUILT — calendar)
  11. Fees → `/dashboard/fees` (FULLY BUILT — fee management)
  12. Marketplace → `/dashboard/marketplace` (NEW — textbook store)
  13. Settings → `/dashboard/settings` (FULLY BUILT — school config)

### 16.2 Teacher-Specific Navigation
- [ ] **Frontend**: Teacher sidebar:
  1. Dashboard
  2. My Classes (view assigned grades/sections)
  3. My Subjects
  4. Scheme of Work (create/edit for assigned subjects)
  5. Lesson Notes
  6. Lectures
  7. Exams (create, grade)
  8. My Students (view students in assigned grades)
  9. Profile
  10. Settings

### 16.3 Student-Specific Navigation
- [ ] **Frontend**: Student sidebar:
  1. Dashboard
  2. My Classes (view own grade/section)
  3. My Subjects
  4. Lectures (view scheduled lectures, join links)
  5. Exams (take exams, view results)
  6. My Results (view grades, download report card)
  7. Events
  8. Marketplace (buy books)
  9. Profile
  10. Settings

---

## Phase 17: Backend — Database Migrations & Seeders

**Why Throughout:** All migrations should be done alongside frontend work.

### 17.1 Migration Order
1. `academic_sessions`
2. `academic_terms`
3. `grade_levels`
4. `sections`
5. `departments`
6. `subjects`
7. `grade_level_subjects`
8. `teacher_subjects`
9. `schemes_of_work`
10. `lesson_notes`
11. `lectures`
12. `lecture_resources`
13. `attendances`
14. `ca_weeks`
15. `exams`
16. `exam_questions`
17. `exam_submissions`
18. `exam_answers`
19. `grade_scales`
20. `student_grades`
21. `report_cards`
22. `result_checks`
23. `student_enrollments`
24. `textbooks`
25. `marketplace_orders`
26. `events`
27. `event_attendees`
28. `fee_structures`
29. `payments`
30. `notices`
31. `syllabuses`
32. `routines`
33. `promotions`

### 17.2 Seeders
- [ ] Default grade scales (Nigerian WAEC, American GPA, French Baccalaureat)
- [ ] Sample academic session + terms
- [ ] Sample grade levels (JSS1–SS3 for Nigerian schools preset)
- [ ] Sample subjects (Mathematics, English, Biology, Chemistry, Physics, etc.)
- [ ] Sample subjects-to-grade mappings (Junior Core, Senior Core, Science Dept, Arts Dept)

---

## Phase 18: AI Integration (Static Tools Interface)

**Why Last (or parallel):** AI is an enhancement, not a blocker. Can be stubbed initially.

### 18.1 AI Service Architecture
- [ ] Backend AI endpoints (stubbed for now, return static data):
  - `POST /api/ai/scheme-of-work`
  - `POST /api/ai/lesson-note`
  - `POST /api/ai/exam`
  - `POST /api/ai/lecture`
- [ ] Integration with AI provider (OpenAI, Claude, or school-assigned model)
- [ ] Rate limiting & cost tracking per school
- [ ] Prompt templates for each builder type
- [ ] Response parsing & validation

---

## Notes & Clarifications

### Grade vs Class vs Lecture
- **Grade Level** = Academic year (JSS1, SS1, Grade 6, 6ème). Stored in `grade_levels` table.
- **Class** = In the sidebar, "Classes" is the management page for grade levels + sections + teachers + subjects.
- **Section** = Subdivision of a grade (JSS1-A, JSS1-B). Stored in `sections` table.
- **Lecture** = A teaching session (scheduled class period). Stored in `lectures` table.
- **Scheme of Work** = Curriculum plan for a subject in a grade, broken into weeks with topics and aspects.
- **Lesson Note** = Teacher's detailed guide for a specific week/topic, based on the scheme of work.

### Nigerian School Context
- **Junior Secondary (JSS1–JSS3):** All students take the same core subjects.
- **Senior Secondary (SS1–SS3):** Students take common subjects + departmental subjects (Science, Arts, Commercial).
- **CA (Continuous Assessment):** Aggregate of tests set throughout the term (e.g., 30% of total score).
- **Exam:** Final term exam (e.g., 70% of total score).
- **Total Score = CA + Exam**, then graded using the school's grade scale.

### Academic Session Configuration Flow
1. Admin creates Academic Session (e.g., "2025/2026").
2. Admin configures number of terms (1, 2, or 3).
3. Admin creates Grade Levels (JSS1, JSS2, etc.).
4. Admin creates Subjects.
5. Admin maps Subjects to Grade Levels.
6. Admin configures CA weeks per grade + subject (which weeks have tests, which has exam).
7. Admin assigns Teachers to Subject + Grade.
8. Teachers create Scheme of Work (manual or AI).
9. Teachers create Lesson Notes (manual or AI) based on scheme.
10. Teachers create Lectures (manual or AI).
11. Teachers create Exams/CA Tests (manual or AI).
12. Students take exams, teachers grade.
13. System computes CA aggregate + Exam = Total → Grade → Report Card.

### Marketplace Flow
1. Receptionist/Admin lists textbooks (electronic or physical).
2. Student brows marketplace (filtered by their grade level).
3. Student purchases book → Payment.
4. If electronic: Student downloads book.
5. If physical: Student downloads reference form → Takes form to school office → Collects book.
6. Receptionist tracks orders, inventory, sales analytics.

---

## Priority Order for Implementation (Summary)

| Priority | Phase | Description |
|----------|-------|-------------|
| 🔴 **P0** | 1 | Academic Session Configuration (Sessions, Terms, CA Weeks, Grade Scales) |
| 🔴 **P0** | 2 | Grade Levels & Class Structure (Grades, Sections, Departments) |
| 🔴 **P0** | 3 | Subjects & Subject-to-Grade Mapping |
| 🟠 **P1** | 4 | Classes Page (Full Implementation) |
| 🟠 **P1** | 5 | Scheme of Work Builder (Manual + AI) |
| 🟠 **P1** | 6 | Lesson Notes Builder (Manual + AI) |
| 🟡 **P2** | 7 | Lectures (Manual + AI, Attendance) |
| 🟡 **P2** | 8 | Exams & Assessments (CA Tests, Exams, Grading) |
| 🟢 **P3** | 9 | Reports & Grades (Report Cards, Result Pins) |
| 🟢 **P3** | 10 | Marketplace (Textbook Store) |
| 🟢 **P3** | 11 | Student Management Updates (Grade/Section Enrollment) |
| 🟢 **P3** | 12 | Teacher Management Updates (Subject/Grade Assignment) |
| 🔵 **P4** | 13 | Events Calendar |
| 🔵 **P4** | 14 | Fees Management |
| 🔵 **P4** | 15 | Settings Page |
| 🔵 **P4** | 16 | Sidebar & Navigation Updates |
| 🟣 **P5** | 17 | Backend Migrations & Seeders (ongoing) |
| 🟣 **P5** | 18 | AI Integration (Stubbed, then Real) |

---

## Next Steps

1. **Confirm this plan with the user.**
2. **Start with Phase 1 (Academic Session Configuration).**
3. **Each phase should be implemented fully (backend + frontend) before moving to the next.**
4. **Test each phase independently before integrating with other modules.**
5. **Use stubs/mock data for AI endpoints initially; integrate real AI later.**

---

*This document will be updated as implementation progresses. Each checkbox should be marked as completed when the corresponding task is done.*
