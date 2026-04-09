<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    /**
     * Seed Super Admin + School Admin accounts.
     *
     * Run with: php artisan db:seed --class=AdminSeeder
     */
    public function run(): void
    {
        $now = now();

        // ─────────────────────────────────────────────
        //  1. SUPER ADMIN (Platform Owner)
        // ─────────────────────────────────────────────
        $superAdminEmail = 'admin@vdeskconnect.com';
        $superAdminPassword = 'SuperAdmin@2026!';

        $superAdmin = DB::table('users')->insertGetId([
            'school_id'            => null,
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

        // Super Admin profile
        DB::table('profiles')->insert([
            'user_id'    => $superAdmin,
            'type'       => 'super_admin',
            'data'       => json_encode(['first_name' => 'Platform', 'last_name' => 'Owner']),
            'avatar_url' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Super Admin gets "Forever & All Unlocked" plan — no school needed
        // We create a "platform" school record for FK consistency if needed
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
            'expires_at'   => null, // never expires
            'status'       => 'active',
            'created_at'   => $now,
            'updated_at'   => $now,
        ]);

        // ─────────────────────────────────────────────
        //  2. SCHOOL ADMIN (Demo School Director)
        // ─────────────────────────────────────────────
        $schoolAdminEmail = 'director@greenfield.edu';
        $schoolAdminPassword = 'SchoolAdmin@2026!';

        // Create demo school
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
                    'currency'   => 'NGN',
                    'timezone'   => 'Africa/Lagos',
                    'date_format' => 'DD/MM/YYYY',
                ],
            ]),
            'active'     => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Create school admin user
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

        // School Admin profile
        DB::table('profiles')->insert([
            'user_id'    => $schoolAdmin,
            'type'       => 'admin',
            'data'       => json_encode(['first_name' => 'John', 'last_name' => 'Director']),
            'avatar_url' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 14-day free trial subscription
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
        //  PRINT CREDENTIALS TO TERMINAL
        // ─────────────────────────────────────────────
        $this->command->getOutput()->newLine();
        $this->command->getOutput()->writeln('╔══════════════════════════════════════════════════════════════════╗');
        $this->command->getOutput()->writeln('║                    vDeskConnect — Seeded Accounts                 ║');
        $this->command->getOutput()->writeln('╠══════════════════════════════════════════════════════════════════╣');
        $this->command->getOutput()->writeln('║                                                                  ║');
        $this->command->getOutput()->writeln('║  SUPER ADMIN (Platform Owner)                                    ║');
        $this->command->getOutput()->writeln('║  ────────────────────────────────                                ║');
        $this->command->getOutput()->writeln(sprintf('║  Email    : %-46s ║', $superAdminEmail));
        $this->command->getOutput()->writeln(sprintf('║  Password : %-46s ║', $superAdminPassword));
        $this->command->getOutput()->writeln('║  Redirect : /admin/dashboard                                      ║');
        $this->command->getOutput()->writeln('║                                                                  ║');
        $this->command->getOutput()->writeln('║  SCHOOL ADMIN (Greenfield Academy Director)                      ║');
        $this->command->getOutput()->writeln('║  ─────────────────────────────────────────────────                ║');
        $this->command->getOutput()->writeln(sprintf('║  Email    : %-46s ║', $schoolAdminEmail));
        $this->command->getOutput()->writeln(sprintf('║  Password : %-46s ║', $schoolAdminPassword));
        $this->command->getOutput()->writeln('║  Redirect : /dashboard                                            ║');
        $this->command->getOutput()->writeln('║  Trial    : 14 days free trial active                             ║');
        $this->command->getOutput()->writeln('║                                                                  ║');
        $this->command->getOutput()->writeln('╚══════════════════════════════════════════════════════════════════╝');
        $this->command->getOutput()->newLine();
        $this->command->info('✓ Seeding complete! Use the credentials above to log in.');
        $this->command->getOutput()->newLine();
    }
}
