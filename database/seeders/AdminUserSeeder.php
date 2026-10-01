<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Admin User Seeder
 *
 * Creates administrator accounts for the TanganakDusun platform.
 * This seeder can be run multiple times safely - it will not create duplicates.
 *
 * Usage:
 * php artisan db:seed --class=AdminUserSeeder
 */
class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates the following admin accounts:
     * 1. afiqah@admin.com (already created via tinker)
     * 2. Additional admin accounts as needed
     */
    public function run(): void
    {
        // Create main admin account (if not exists)
        User::firstOrCreate(
            ['email' => 'afiqah@admin.com'],
            [
                'name' => 'Afiqah Admin',
                'password' => Hash::make('afiqah123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✓ Main admin account created: afiqah@admin.com');

        // Create additional admin account for testing
        User::firstOrCreate(
            ['email' => 'admin@tgkdsn.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✓ System admin account created: admin@tgkdsn.com');

        // Create a test regular user account
        User::firstOrCreate(
            ['email' => 'user@tgkdsn.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('user123'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✓ Test user account created: user@tgkdsn.com');

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('Admin Seeding Complete!');
        $this->command->info('========================================');
        $this->command->info('');
        $this->command->info('Administrator Accounts:');
        $this->command->info('  Email: afiqah@admin.com | Password: afiqah123');
        $this->command->info('  Email: admin@tgkdsn.com | Password: admin123');
        $this->command->info('');
        $this->command->info('Regular User Account:');
        $this->command->info('  Email: user@tgkdsn.com | Password: user123');
        $this->command->info('');
    }
}
