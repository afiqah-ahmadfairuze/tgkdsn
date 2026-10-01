<?php

namespace Database\Seeders;

use App\Models\QuizAttempt;
use App\Models\User;
use App\Models\Quiz;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuizAttemptSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get test user and quiz for creating sample attempts
        $testUser = User::where('email', 'user@tgkdsn.com')->first();
        $quizzes = Quiz::take(3)->get();

        if ($testUser && $quizzes->count() > 0) {
            // Create sample quiz attempts for the test user
            foreach ($quizzes as $index => $quiz) {
                QuizAttempt::create([
                    'user_id' => $testUser->id,
                    'quiz_id' => $quiz->id,
                    'marks_obtained' => 50 + ($index * 20), // 50, 70, 90
                    'attempted_at' => now()->subDays($index),
                ]);
            }

            $this->command->info('✓ Sample quiz attempts created for test user');
        }
    }
}
