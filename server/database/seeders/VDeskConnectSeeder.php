<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class VDeskConnectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This is the ONLY seeder for the entire application.
     *
     * Run with: php artisan db:seed --class=VDeskConnectSeeder
     */
    public function run(): void
    {
        $output = $this->command->getOutput();
        $now = now();

        // ─────────────────────────────────────────────
        //  1. SUPER ADMIN (Platform Owner)
        // ─────────────────────────────────────────────
        $superAdminEmail = 'admin@vdeskconnect.com';
        $superAdminPassword = 'SuperAdmin@2026!';

        // Idempotent: delete existing super admin if present
        DB::table('profiles')->where('type', 'super_admin')->delete();
        DB::table('users')->where('email', $superAdminEmail)->delete();
        DB::table('schools')->where('name', 'vDeskConnect Platform')->delete();

        // Platform school record for FK consistency
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

        // Idempotent: delete existing demo school + admin if present
        $existingSchool = DB::table('schools')->where('name', 'Greenfield Academy')->first();
        if ($existingSchool) {
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
        //  PRINT CREDENTIALS TO TERMINAL
        // ─────────────────────────────────────────────
        $output->writeln('');
        $output->writeln('<fg=green;options=bold>╔══════════════════════════════════════════════════════════════════╗</>');
        $output->writeln('<fg=green;options=bold>║</>                <fg=green;options=bold>vDeskConnect — Seeded Accounts</>                     <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>╠══════════════════════════════════════════════════════════════════╣</>');
        $output->writeln('<fg=green;options=bold>║</>                                                                  <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>  <fg=cyan>SUPER ADMIN</> (Platform Owner)                                    <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>  ────────────────────────────────                                <fg=green;options=bold>║</>');
        $output->writeln(sprintf('<fg=green;options=bold>║</>  %-68s <fg=green;options=bold>║</>', '<fg=yellow>Email</>    : ' . $superAdminEmail));
        $output->writeln(sprintf('<fg=green;options=bold>║</>  %-68s <fg=green;options=bold>║</>', '<fg=yellow>Password</> : ' . $superAdminPassword));
        $output->writeln('<fg=green;options=bold>║</>  Redirect : /admin/dashboard                                      <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>                                                                  <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>  <fg=cyan>SCHOOL ADMIN</> (Greenfield Academy Director)                      <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>  ─────────────────────────────────────────────────                <fg=green;options=bold>║</>');
        $output->writeln(sprintf('<fg=green;options=bold>║</>  %-68s <fg=green;options=bold>║</>', '<fg=yellow>Email</>    : ' . $schoolAdminEmail));
        $output->writeln(sprintf('<fg=green;options=bold>║</>  %-68s <fg=green;options=bold>║</>', '<fg=yellow>Password</> : ' . $schoolAdminPassword));
        $output->writeln('<fg=green;options=bold>║</>  Redirect : /dashboard                                            <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>  Trial    : 14 days free trial active                             <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>║</>                                                                  <fg=green;options=bold>║</>');
        $output->writeln('<fg=green;options=bold>╚══════════════════════════════════════════════════════════════════╝</>');
        $output->writeln('');
        $output->writeln('<fg=green;options=bold>✓ Seeding complete! Use the credentials above to log in.</>');
        $output->writeln('');
    }
}
