<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates all quiz tracking and gamification tables:
     * - quiz_attempts: Records of user quiz submissions
     * - bonus_points: Admin-awarded bonus points
     * - leaderboard_histories: Historical leaderboard snapshots
     * - user_streaks: Consecutive day tracking for user engagement
     */
    public function up(): void
    {
        // Quiz attempts table
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->integer('marks_obtained');
            $table->integer('bonus_points')->default(0);
            $table->timestamp('attempted_at')->useCurrent();
            $table->timestamps();
        });

        // Bonus points table (admin-awarded)
        Schema::create('bonus_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('admin_id')->constrained('users')->cascadeOnDelete();
            $table->integer('points'); // Bonus points awarded
            $table->string('reason')->nullable(); // Reason for bonus points
            $table->timestamps();

            // Indexes for faster queries
            $table->index('user_id');
            $table->index('admin_id');
        });

        // Leaderboard history table
        Schema::create('leaderboard_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('rank'); // Rank at time of reset
            $table->integer('total_marks'); // Total marks at reset
            $table->integer('total_quizzes'); // Total quizzes attempted at reset
            $table->integer('streak_count'); // Streak count at time of reset
            $table->timestamp('reset_date'); // When the leaderboard reset occurred
            $table->timestamps();

            // Indexes for faster queries
            $table->index('user_id');
            $table->index('reset_date');
        });

        // User streaks table
        Schema::create('user_streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->integer('current_streak')->default(0); // Number of consecutive days
            $table->date('last_quiz_date')->nullable(); // Last date they attempted a quiz
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_streaks');
        Schema::dropIfExists('leaderboard_histories');
        Schema::dropIfExists('bonus_points');
        Schema::dropIfExists('quiz_attempts');
    }
};
