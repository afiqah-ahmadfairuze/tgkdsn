<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Add test users with Dusun names, covering Year 1-6 (ages 7-12)
        User::factory()->create([
            'name' => 'Rasu',
            'email' => 'rasu@example.com',
            'birthday' => '2017-03-20',
            'age' => 7,
            'gender' => 'Male',
            'role' => 'child',
            'guardian_fullname' => 'Dalan Rasu',
            'guardian_phone' => '+60123456788',
            'guardian_email' => 'dalan@example.com',
        ]);

        User::factory()->create([
            'name' => 'Rinom',
            'email' => 'rinom@example.com',
            'birthday' => '2016-12-10',
            'age' => 8,
            'gender' => 'Female',
            'role' => 'child',
            'guardian_fullname' => 'Bitin Rinom',
            'guardian_phone' => '+60123456789',
            'guardian_email' => 'bitin@example.com',
        ]);

        User::factory()->create([
            'name' => 'Minuon',
            'email' => 'minuon@example.com',
            'birthday' => '2016-11-15',
            'age' => 9,
            'gender' => 'Male',
            'role' => 'child',
            'guardian_fullname' => 'Jamal Minuon',
            'guardian_phone' => '+60123456789',
            'guardian_email' => 'jamal@example.com',
        ]);

        User::factory()->create([
            'name' => 'Salayo',
            'email' => 'salayo@example.com',
            'birthday' => '2015-08-22',
            'age' => 10,
            'gender' => 'Female',
            'role' => 'child',
            'guardian_fullname' => 'Suki Salayo',
            'guardian_phone' => '+60123456790',
            'guardian_email' => 'suki@example.com',
        ]);

        User::factory()->create([
            'name' => 'Aujong',
            'email' => 'aujong@example.com',
            'birthday' => '2014-05-10',
            'age' => 11,
            'gender' => 'Male',
            'role' => 'child',
            'guardian_fullname' => 'Roti Aujong',
            'guardian_phone' => '+60123456791',
            'guardian_email' => 'roti@example.com',
        ]);

        User::factory()->create([
            'name' => 'Suling',
            'email' => 'suling@example.com',
            'birthday' => '2013-03-28',
            'age' => 12,
            'gender' => 'Female',
            'role' => 'child',
            'guardian_fullname' => 'Nora Suling',
            'guardian_phone' => '+60123456792',
            'guardian_email' => 'nora@example.com',
        ]);

        User::factory()->create([
            'name' => 'Umpi',
            'email' => 'umpi@example.com',
            'birthday' => '2016-06-05',
            'age' => 9,
            'gender' => 'Male',
            'role' => 'child',
            'guardian_fullname' => 'Kawin Umpi',
            'guardian_phone' => '+60123456793',
            'guardian_email' => 'kawin@example.com',
        ]);

        // Run additional seeders
        $this->call([
            AdminUserSeeder::class,
            QuizSeeder::class,
            QuizAttemptSeeder::class,
        ]);
    }
}
