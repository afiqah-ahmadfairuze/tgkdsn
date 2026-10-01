<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserStreak;
use Illuminate\Support\Carbon;

class StreakService
{
    /* Update how many days in a row a student has done quizzes */
    public function updateStreakAfterQuizAttempt(User $user): UserStreak
    {
        $today = now()->toDateString();

        /* Get their streak record or make a new one if they don't have one yet */
        $streak = $user->streak()->firstOrCreate(
            ['user_id' => $user->id],
            ['current_streak' => 0, 'last_quiz_date' => null]
        );

        $lastQuizDate = $streak->last_quiz_date ? $streak->last_quiz_date->toDateString() : null;

        /* If they already did a quiz today, don't change anything */
        if ($lastQuizDate === $today) {
            return $streak;
        }

        /* Check when was the last time they did a quiz */
        $yesterday = now()->subDay()->toDateString();

        if ($lastQuizDate === $yesterday) {
            /* They did a quiz yesterday, so add 1 to their streak */
            $streak->current_streak += 1;
        } elseif ($lastQuizDate === null) {
            /* This is their very first quiz */
            $streak->current_streak = 1;
        } else {
            /* They missed some days, so start the streak over */
            $streak->current_streak = 1;
        }

        /* Remember that they did a quiz today */
        $streak->last_quiz_date = $today;
        $streak->save();

        return $streak;
    }

    /* Check how many days in a row a student has done quizzes */
    public function getCurrentStreak(User $user): int
    {
        $streak = $user->streak();

        if (!$streak) {
            return 0;
        }

        $today = now()->toDateString();
        $lastQuizDate = $streak->last_quiz_date ? $streak->last_quiz_date->toDateString() : null;

        /* See if their streak is still going (did they do a quiz today or yesterday?) */
        if ($lastQuizDate === $today || $lastQuizDate === now()->subDay()->toDateString()) {
            return $streak->current_streak ?? 0;
        }

        /* They broke their streak by skipping too many days */
        return 0;
    }

    /* Reset everyone's streaks back to zero (used when resetting the leaderboard) */
    public function resetAllStreaks(): void
    {
        UserStreak::update(['current_streak' => 0]);
    }

    /* Get streak info for all students */
    public function getAllStreakData(): array
    {
        /* Get all streak records sorted by highest streak first */
        $streaks = UserStreak::with('user')
            ->orderBy('current_streak', 'desc')
            ->get();

        return $streaks->map(function ($streak) {
            return [
                'user_id' => $streak->user->user_id,
                'name' => $streak->user->name,
                'age' => $streak->user->age,
                'gender' => $streak->user->gender,
                'current_streak' => $streak->current_streak,
                'total_marks' => $this->calculateUserTotalMarks($streak->user),
                'total_quizzes' => $streak->user->quizAttempts()->count(),
            ];
        })->toArray();
    }

    /* Add up all the marks a student has earned (quiz marks + bonus points) */
    public function calculateUserTotalMarks(User $user): int
    {
        $quizMarks = $user->quizAttempts()->sum('marks_obtained');
        $bonusPoints = $user->bonusPointsReceived()->sum('points');

        return $quizMarks + $bonusPoints;
    }
}
