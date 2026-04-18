<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class VDeskConnectSeeder extends Seeder
{
    public function run(): void
    {
        $output = $this->command->getOutput();
        $now = Carbon::now();

        // ─────────────────────────────────────────────
        //  1. SUPER ADMIN (Platform Owner)
        // ─────────────────────────────────────────────
        $superAdminEmail = 'admin@vdeskconnect.com';
        $superAdminPassword = 'SuperAdmin@2026!';

        DB::table('profiles')->where('type', 'super_admin')->delete();
        DB::table('users')->where('email', $superAdminEmail)->delete();
        DB::table('schools')->where('name', 'vDeskConnect Platform')->delete();

        $platformSchool = DB::table('schools')->insertGetId([
            'name'       => 'vDeskConnect Platform',
            'country'    => 'GLOBAL',
            'timezone'   => 'UTC',
            'currency'   => 'USD',
            'logo_url'   => null,
            'config'     => json_encode(['is_platform' => true]),
            'active'     => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('subscriptions')->insert([
            'school_id'    => $platformSchool,
            'plan_id'      => 'forever_unlimited',
            'starts_at'    => $now,
            'expires_at'   => null,
            'status'       => 'active',
            'created_at'   => $now,
            'updated_at'   => $now,
        ]);

        $superAdmin = DB::table('users')->insertGetId([
            'school_id'            => $platformSchool,
            'email'                => $superAdminEmail,
            'password'             => Hash::make($superAdminPassword),
            'role'                 => 'super_admin',
            'verified'             => true,
            'must_change_password' => false,
            'last_login_at'        => null,
            'remember_token'       => Str::random(10),
            'created_at'           => $now,
            'updated_at'           => $now,
        ]);

        DB::table('profiles')->insert([
            'user_id'    => $superAdmin,
            'type'       => 'super_admin',
            'data'       => json_encode(['first_name' => 'Platform', 'last_name' => 'Owner']),
            'avatar_url' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // ─────────────────────────────────────────────
        //  2. SCHOOL ADMIN (Demo School Director)
        // ─────────────────────────────────────────────
        $schoolAdminEmail = 'director@greenfield.edu';
        $schoolAdminPassword = 'SchoolAdmin@2026!';

        $existingSchool = DB::table('schools')->where('name', 'Greenfield Academy')->first();
        if ($existingSchool) {
            // Delete resources first to avoid FK issues
            DB::table('lecture_resources')->whereIn('lecture_id', 
                DB::table('lectures')->where('school_id', $existingSchool->id)->pluck('id')
            )->delete();
            DB::table('lectures')->where('school_id', $existingSchool->id)->delete();
            DB::table('subscriptions')->where('school_id', $existingSchool->id)->delete();
            DB::table('users')->where('school_id', $existingSchool->id)->delete();
            DB::table('schools')->where('id', $existingSchool->id)->delete();
        }

        $demoSchool = DB::table('schools')->insertGetId([
            'name'       => 'Greenfield Academy',
            'country'    => 'NG',
            'timezone'   => 'Africa/Lagos',
            'currency'   => 'NGN',
            'logo_url'   => null,
            'config'     => json_encode([
                'academic_labels' => [
                    'grade_label' => 'Class',
                    'term_label'  => 'Term',
                ],
                'academic_structure' => [
                    'terms_per_year'   => 3,
                    'term_names'       => ['Term 1', 'Term 2', 'Term 3'],
                    'weeks_per_term'   => 12,
                    'grading_scale'    => 'percentage',
                ],
                'localization' => [
                    'currency'    => 'NGN',
                    'timezone'    => 'Africa/Lagos',
                    'date_format' => 'DD/MM/YYYY',
                ],
            ]),
            'active'     => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $schoolAdmin = DB::table('users')->insertGetId([
            'school_id'            => $demoSchool,
            'email'                => $schoolAdminEmail,
            'password'             => Hash::make($schoolAdminPassword),
            'role'                 => 'admin',
            'verified'             => true,
            'must_change_password' => false,
            'last_login_at'        => null,
            'remember_token'       => Str::random(10),
            'created_at'           => $now,
            'updated_at'           => $now,
        ]);

        DB::table('profiles')->insert([
            'user_id'    => $schoolAdmin,
            'type'       => 'admin',
            'data'       => json_encode(['first_name' => 'John', 'last_name' => 'Director']),
            'avatar_url' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('subscriptions')->insert([
            'school_id'    => $demoSchool,
            'plan_id'      => 'trial',
            'starts_at'    => $now,
            'expires_at'   => $now->addDays(14),
            'status'       => 'trial',
            'created_at'   => $now,
            'updated_at'   => $now,
        ]);

        // ─────────────────────────────────────────────
        //  3. ACADEMIC SESSION & TERMS
        // ─────────────────────────────────────────────
        $academicSession = DB::table('academic_sessions')->insertGetId([
            'school_id'    => $demoSchool,
            'name'         => '2025/2026 Academic Year',
            'start_date'   => '2025-09-01',
            'end_date'     => '2026-08-31',
            'active'       => true,
            'created_at'   => $now,
            'updated_at'   => $now,
        ]);

        $term1 = DB::table('academic_terms')->insertGetId([
            'school_id'         => $demoSchool,
            'session_id'        => $academicSession,
            'name'              => 'First Term',
            'order'             => 1,
            'start_date'        => '2025-09-01',
            'end_date'          => '2025-11-30',
            'created_at'        => $now,
            'updated_at'        => $now,
        ]);

        $term2 = DB::table('academic_terms')->insertGetId([
            'school_id'         => $demoSchool,
            'session_id'        => $academicSession,
            'name'              => 'Second Term',
            'order'             => 2,
            'start_date'        => '2025-12-01',
            'end_date'          => '2026-03-31',
            'created_at'        => $now,
            'updated_at'        => $now,
        ]);

        // ─────────────────────────────────────────────
        //  4. GRADE LEVELS (Classes)
        // ─────────────────────────────────────────────
        $jss1 = DB::table('grade_levels')->insertGetId([
            'school_id'  => $demoSchool,
            'name'       => 'JSS 1',
            'short_name' => 'JSS1',
            'order'      => 1,
            'cycle'      => 'Junior',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $jss2 = DB::table('grade_levels')->insertGetId([
            'school_id'  => $demoSchool,
            'name'       => 'JSS 2',
            'short_name' => 'JSS2',
            'order'      => 2,
            'cycle'      => 'Junior',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $ss1 = DB::table('grade_levels')->insertGetId([
            'school_id'  => $demoSchool,
            'name'       => 'SS 1',
            'short_name' => 'SS1',
            'order'      => 4,
            'cycle'      => 'Senior',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Sections for JSS1
        DB::table('sections')->insert([
            ['school_id' => $demoSchool, 'grade_level_id' => $jss1, 'name' => 'A', 'room_number' => '101', 'capacity' => 35, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $demoSchool, 'grade_level_id' => $jss1, 'name' => 'B', 'room_number' => '102', 'capacity' => 35, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // ─────────────────────────────────────────────
        //  5. SUBJECTS
        // ─────────────────────────────────────────────
        $math = DB::table('subjects')->insertGetId([
            'school_id'  => $demoSchool,
            'name'       => 'Mathematics',
            'code'       => 'MTH',
            'type'       => 'core',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $english = DB::table('subjects')->insertGetId([
            'school_id'  => $demoSchool,
            'name'       => 'English Language',
            'code'       => 'ENG',
            'type'       => 'core',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $biology = DB::table('subjects')->insertGetId([
            'school_id'  => $demoSchool,
            'name'       => 'Biology',
            'code'       => 'BIO',
            'type'       => 'core',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $physics = DB::table('subjects')->insertGetId([
            'school_id'  => $demoSchool,
            'name'       => 'Physics',
            'code'       => 'PHY',
            'type'       => 'core',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $chemistry = DB::table('subjects')->insertGetId([
            'school_id'  => $demoSchool,
            'name'       => 'Chemistry',
            'code'       => 'CHM',
            'type'       => 'core',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Grade level subjects
        DB::table('grade_level_subjects')->insert([
            ['school_id' => $demoSchool, 'grade_level_id' => $jss1, 'subject_id' => $math, 'is_compulsory' => true, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $demoSchool, 'grade_level_id' => $jss1, 'subject_id' => $english, 'is_compulsory' => true, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $demoSchool, 'grade_level_id' => $jss1, 'subject_id' => $biology, 'is_compulsory' => true, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $demoSchool, 'grade_level_id' => $jss1, 'subject_id' => $physics, 'is_compulsory' => true, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $demoSchool, 'grade_level_id' => $jss1, 'subject_id' => $chemistry, 'is_compulsory' => true, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $demoSchool, 'grade_level_id' => $ss1, 'subject_id' => $math, 'is_compulsory' => true, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $demoSchool, 'grade_level_id' => $ss1, 'subject_id' => $english, 'is_compulsory' => true, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $demoSchool, 'grade_level_id' => $ss1, 'subject_id' => $biology, 'is_compulsory' => true, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $demoSchool, 'grade_level_id' => $ss1, 'subject_id' => $physics, 'is_compulsory' => true, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $demoSchool, 'grade_level_id' => $ss1, 'subject_id' => $chemistry, 'is_compulsory' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // ─────────────────────────────────────────────
        //  6. TEACHERS
        // ─────────────────────────────────────────────
        $teacher1 = DB::table('users')->insertGetId([
            'school_id'            => $demoSchool,
            'email'                => 'mr.adeyemi@greenfield.edu',
            'password'             => Hash::make('Teacher@2026!'),
            'role'                 => 'teacher',
            'verified'             => true,
            'must_change_password' => false,
            'created_at'           => $now,
            'updated_at'           => $now,
        ]);

        DB::table('profiles')->insert([
            'user_id'    => $teacher1,
            'type'       => 'teacher',
            'data'       => json_encode(['first_name' => 'Adeyemi', 'last_name' => 'Olabisi', 'phone' => '08012345678', 'address' => 'Lagos, Nigeria']),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $teacher2 = DB::table('users')->insertGetId([
            'school_id'            => $demoSchool,
            'email'                => 'mrs.okonkwo@greenfield.edu',
            'password'             => Hash::make('Teacher@2026!'),
            'role'                 => 'teacher',
            'verified'             => true,
            'must_change_password' => false,
            'created_at'           => $now,
            'updated_at'           => $now,
        ]);

        DB::table('profiles')->insert([
            'user_id'    => $teacher2,
            'type'       => 'teacher',
            'data'       => json_encode(['first_name' => 'Chioma', 'last_name' => 'Okonkwo', 'phone' => '08023456789', 'address' => 'Abuja, Nigeria']),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Teacher subjects
        DB::table('teacher_subjects')->insert([
            ['school_id' => $demoSchool, 'teacher_id' => $teacher1, 'subject_id' => $math, 'grade_level_id' => $jss1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $demoSchool, 'teacher_id' => $teacher1, 'subject_id' => $math, 'grade_level_id' => $jss2, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $demoSchool, 'teacher_id' => $teacher2, 'subject_id' => $english, 'grade_level_id' => $jss1, 'created_at' => $now, 'updated_at' => $now],
            ['school_id' => $demoSchool, 'teacher_id' => $teacher2, 'subject_id' => $english, 'grade_level_id' => $ss1, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // ─────────────────────────────────────────────
        //  7. STAFF (Non-Teaching)
        // ─────────────────────────────────────────────
        $staff1 = DB::table('users')->insertGetId([
            'school_id'            => $demoSchool,
            'email'                => 'reception@greenfield.edu',
            'password'             => Hash::make('Staff@2026!'),
            'role'                 => 'staff',
            'verified'             => true,
            'must_change_password' => false,
            'created_at'           => $now,
            'updated_at'           => $now,
        ]);

        DB::table('profiles')->insert([
            'user_id'    => $staff1,
            'type'       => 'staff',
            'data'       => json_encode(['first_name' => 'Grace', 'last_name' => 'Marcus', 'phone' => '08034567890', 'position' => 'Receptionist']),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // ─────────────────────────────────────────────
        //  8. STUDENTS
        // ─────────────────────────────────────────────
        $students = [
            ['first_name' => 'Emmanuel', 'last_name' => 'Adebayo', 'email' => 'adebayo.e@greenfield.edu'],
            ['first_name' => 'Fatima', 'last_name' => 'Mohammed', 'email' => 'mohammed.f@greenfield.edu'],
            ['first_name' => 'David', 'last_name' => 'Okafor', 'email' => 'okonor.d@greenfield.edu'],
            ['first_name' => 'Chidinma', 'last_name' => 'Eze', 'email' => 'eze.c@greenfield.edu'],
            ['first_name' => 'Blessing', 'last_name' => 'Adeyemi', 'email' => 'adeyemi.b@greenfield.edu'],
            ['first_name' => 'Samuel', 'last_name' => 'Uche', 'email' => 'uche.s@greenfield.edu'],
            ['first_name' => 'Grace', 'last_name' => 'Ogbonna', 'email' => 'ogbonna.g@greenfield.edu'],
            ['first_name' => 'Michael', 'last_name' => 'Okonkwo', 'email' => 'okonkwo.m@greenfield.edu'],
            ['first_name' => 'Sarah', 'last_name' => 'Idris', 'email' => 'idris.s@greenfield.edu'],
            ['first_name' => 'Peter', 'last_name' => 'Chukwu', 'email' => 'chukwu.p@greenfield.edu'],
        ];

        $sectionA = DB::table('sections')->where('grade_level_id', $jss1)->where('name', 'A')->first();

        foreach ($students as $index => $student) {
            $studentId = DB::table('users')->insertGetId([
                'school_id'            => $demoSchool,
                'email'                => $student['email'],
                'password'             => Hash::make('Student@2026!'),
                'role'                 => 'student',
                'verified'             => true,
                'must_change_password' => false,
                'created_at'           => $now,
                'updated_at'           => $now,
            ]);

            DB::table('profiles')->insert([
                'user_id'    => $studentId,
                'type'       => 'student',
                'data'       => json_encode(['first_name' => $student['first_name'], 'last_name' => $student['last_name'], 'phone' => '080' . str_pad($index + 1, 8, '0', STR_PAD_LEFT), 'grade_level_id' => $jss1]),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ─────────────────────────────────────────────
        //  9. LECTURES WITH CONTENT
        // ─────────────────────────────────────────────
        $lectureContent = "## Introduction to Algebra

Welcome to this lesson on Algebra. In this section, we will explore the fundamental concepts of algebraic expressions and equations.

### What is Algebra?
Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. It is a powerful tool for solving problems.

### Variables and Constants
- **Variables**: Letters that represent unknown values (x, y, z)
- **Constants**: Fixed numerical values (2, 5, -3)

## Simple Equations

An equation is a mathematical statement that shows two expressions are equal using the equals sign (=).

### Example:
x + 5 = 12

To solve: subtract 5 from both sides
x = 12 - 5
x = 7

## Practice Problems

Try these problems on your own:
1. x + 8 = 15
2. y - 3 = 10
3. 2z = 20

---

## Summary

In this lecture, we covered:
- Understanding variables and constants
- Writing simple algebraic expressions
- Solving basic linear equations

Remember: Practice makes perfect!";

        $lecture1 = DB::table('lectures')->insertGetId([
            'school_id'              => $demoSchool,
            'teacher_id'            => $teacher1,
            'grade_level_id'        => $jss1,
            'subject_id'            => $math,
            'section_id'            => $sectionA->id ?? null,
            'title'                 => 'Introduction to Algebra - Part 1',
            'description'           => 'Learn the basics of algebraic expressions and simple equations',
            'scheduled_at'          => $now->copy()->addDays(1),
            'duration_minutes'      => 40,
            'status'                => 'scheduled',
            'type'                  => 'async',
            'is_published'          => true,
            'content'               => $lectureContent,
            'created_by'            => $teacher1,
            'created_at'            => $now,
            'updated_at'            => $now,
        ]);

        // Second lecture
        $lectureContent2 = "## Introduction to English Grammar

Welcome to today's English lesson on Parts of Speech.

### Nouns
A noun is a word that names a person, place, thing, or idea.
- Person: teacher, doctor
- Place: Lagos, school
- Thing: book, table
- Idea: happiness, freedom

### Verbs
A verb is a word that expresses action or state of being.
- Action: run, eat, write
- State: be, seem, feel

### Adjectives
An adjective describes or modifies a noun.
- Example: The **big** house, A **beautiful** flower

## Practice

Identify the parts of speech in these sentences:
1. The **quick** brown fox jumps.
2. She **runs** very fast.

---

## Conclusion

Understanding parts of speech is essential for proper English communication.";

        $lecture2 = DB::table('lectures')->insertGetId([
            'school_id'              => $demoSchool,
            'teacher_id'            => $teacher2,
            'grade_level_id'        => $jss1,
            'subject_id'            => $english,
            'section_id'            => $sectionA->id ?? null,
            'title'                 => 'English Grammar - Parts of Speech',
            'description'           => 'Understanding nouns, verbs, and adjectives',
            'scheduled_at'          => $now->copy()->addDays(2),
            'duration_minutes'      => 40,
            'status'                => 'scheduled',
            'type'                  => 'async',
            'is_published'          => true,
            'content'               => $lectureContent2,
            'created_by'            => $teacher2,
            'created_at'            => $now,
            'updated_at'            => $now,
        ]);

        // ─────────────────────────────────────────────
        //  10. LECTURE RESOURCES (Sample)
        // ─────────────────────────────────────────────
        // Resource for entire lecture 1
        DB::table('lecture_resources')->insert([
            'lecture_id'     => $lecture1,
            'type'           => 'link',
            'url'            => 'https://www.khanacademy.org/math/algebra',
            'title'          => 'Khan Academy - Algebra Basics',
            'uploaded_by'    => $teacher1,
            'content_id'     => null, // Entire lecture
            'order_index'    => 0,
            'is_downloadable'=> false,
            'is_savable'     => true,
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);

        // Resource for section 1 of lecture 1 (Introduction)
        DB::table('lecture_resources')->insert([
            'lecture_id'     => $lecture1,
            'type'           => 'video',
            'url'            => 'https://www.youtube.com/watch?v=4mcGl3gjvsQ',
            'title'          => 'Introduction Video - What is Algebra?',
            'uploaded_by'    => $teacher1,
            'content_id'     => 0, // First section
            'order_index'    => 0,
            'is_downloadable'=> true,
            'is_savable'     => false,
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);

        // Resource for section 2 of lecture 1 (Simple Equations)
        DB::table('lecture_resources')->insert([
            'lecture_id'     => $lecture1,
            'type'           => 'pdf',
            'url'            => 'https://www.w3schools.com/algebra/algebra_examples.asp',
            'title'          => 'Practice Worksheet - Simple Equations',
            'uploaded_by'    => $teacher1,
            'content_id'     => 1, // Second section
            'order_index'    => 1,
            'is_downloadable'=> true,
            'is_savable'     => true,
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);

        // Resources for lecture 2
        DB::table('lecture_resources')->insert([
            'lecture_id'     => $lecture2,
            'type'           => 'link',
            'url'            => 'https://www.grammarly.com/blog/parts-of-speech/',
            'title'          => 'Grammar Guide - Parts of Speech',
            'uploaded_by'    => $teacher2,
            'content_id'     => null, // Entire lecture
            'order_index'    => 0,
            'is_downloadable'=> false,
            'is_savable'     => true,
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);

        // ─────────────────────────────────────────────
        //  PRINT CREDENTIALS TO TERMINAL
        // ─────────────────────────────────────────────
        $output->writeln('');
        $output->writeln('<fg=green;options=bold>╔══════════════════════════════════════════════════════════════════╗</>');
        $output->writeln('<fg=green;options=bold>║</>                <fg=green;options=bold>vDeskConnect — Seeded Demo Data</>                     <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>╠══════════════════════════════════════════════════════════════════╣</>');
        $output->writeln('<fg=green;options=bold>║</>                                                                  <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>  <fg=cyan>SUPER ADMIN</> (Platform Owner)                                    <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>  ────────────────────────────────                                <fg=green;options=bold>║</>');
        $output->writeln(sprintf('<fg=green;options=bold>║</>  %-68s <fg=green;options=bold>║</>', '<fg=yellow>Email</>    : ' . $superAdminEmail));
        $output->writeln(sprintf('<fg=green;options=bold>║</>  %-68s <fg=green;options=bold>║</>', '<fg=yellow>Password</> : ' . $superAdminPassword));
        $output->writeln('<fg=green;options=bold>║</>  Redirect : /admin/dashboard                                      <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>                                                                  <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>  <fg=cyan>SCHOOL DIRECTOR</> (Greenfield Academy)                            <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>  ─────────────────────────────────────────────────                <fg=green;options=bold>║</>');
        $output->writeln(sprintf('<fg=green;options=bold>║</>  %-68s <fg=green;options=bold>║</>', '<fg=yellow>Email</>    : ' . $schoolAdminEmail));
        $output->writeln(sprintf('<fg=green;options=bold>║</>  %-68s <fg=green;options=bold>║</>', '<fg=yellow>Password</> : ' . $schoolAdminPassword));
        $output->writeln('<fg=green;options=bold>║</>                                                                  <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>  <fg=cyan>TEACHER</>                                                             <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>  ─────────────────────────────────────────────────                <fg=green;options=bold>║</>');
        $output->writeln(sprintf('<fg=green;options=bold>║</>  %-68s <fg=green;options=bold>║</>', '<fg=yellow>Email</>    : mr.adeyemi@greenfield.edu'));
        $output->writeln(sprintf('<fg=green;options=bold>║</>  %-68s <fg=green;options=bold>║</>', '<fg=yellow>Password</> : Teacher@2026!'));
        $output->writeln('<fg=green;options=bold>║</>                                                                  <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>  <fg=cyan>STUDENT</>                                                             <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>  ─────────────────────────────────────────────────                <fg=green;options=bold>║</>');
        $output->writeln(sprintf('<fg=green;options=bold>║</>  %-68s <fg=green;options=bold>║</>', '<fg=yellow>Email</>    : adebayo.e@greenfield.edu'));
        $output->writeln(sprintf('<fg=green;options=bold>║</>  %-68s <fg=green;options=bold>║</>', '<fg=yellow>Password</> : Student@2026!'));
        $output->writeln('<fg=green;options=bold>║</>                                                                  <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>╚══════════════════════════════════════════════════════════════════╝</>');
        $output->writeln('');
        $output->writeln('<fg=green>✓ Demo data seeded successfully!</>');
        $output->writeln('<fg=yellow>→ Academic Session: 2025/2026 (Terms 1, 2)</>');
        $output->writeln('<fg=yellow>→ Classes: JSS 1, JSS 2, SS 1 with sections</>');
        $output->writeln('<fg=yellow>→ Subjects: Mathematics, English, Biology, Physics, Chemistry</>');
        $output->writeln('<fg=yellow>→ 2 Lectures with content sections and resources</>');
        $output->writeln('');
    }
}