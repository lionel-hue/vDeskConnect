<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * This is the ONLY seeder for the entire vDeskConnect application.
     *
     * Run with: php artisan db:seed
     */
    public function run(): void
    {
        $this->call([
            VDeskConnectSeeder::class,
        ]);
    }
}
