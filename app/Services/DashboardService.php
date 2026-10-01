<?php

namespace App\Services;

use App\Models\User;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Feedback;
use App\Models\DictionaryEntry;
use App\Models\BonusPoints;
use App\Models\LearningMaterial;
use Carbon\Carbon;

class DashboardService
{
    /**
     * Get comprehensive dashboard metrics
     */
    public function getDashboardMetrics(): array
    {
        return [
            'key_metrics' => $this->getKeyMetrics(),
            'user_demographics' => $this->getUserDemographics(),
            'quiz_activity' => $this->getQuizActivity(),
            'feedback_summary' => $this->getFeedbackSummary(),
            'recent_activity' => $this->getRecentActivity(),
            'top_performers' => $this->getTopPerformers(),
            'bonus_points_info' => $this->getBonusPointsInfo(),
            'dictionary_status' => $this->getDictionaryStatus(),
        ];
    }

    /**
     * Get key metrics (total counts and key numbers)
     */
    private function getKeyMetrics(): array
    {
        $totalUsers = User::where('role', 'user')->count();
        $activeUsers = User::where('role', 'user')
            ->where('updated_at', '>=', Carbon::now()->subDays(30))
            ->count();
        $totalQuizzes = Quiz::count();
        $totalFeedback = Feedback::count();
        $totalIssues = Feedback::where('issue_reported', true)->count();
        $dictionaryEntries = DictionaryEntry::count();
        $totalLearningMaterials = LearningMaterial::count();

        // Get top user on leaderboard
        $topUser = User::where('role', 'user')
            ->with('quizAttempts')
            ->get()
            ->map(function ($user) {
                $totalScore = $user->quizAttempts->sum('score');
                $bonusPoints = BonusPoints::where('user_id', $user->id)->sum('points');
                return [
                    'user' => $user,
                    'total_score' => $totalScore,
                    'bonus_points' => $bonusPoints,
                    'quiz_count' => $user->quizAttempts->count(),
                ];
            })
            ->sortByDesc('total_score')
            ->first();

        return [
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'total_quizzes' => $totalQuizzes,
            'total_feedback' => $totalFeedback,
            'total_issues' => $totalIssues,
            'dictionary_entries' => $dictionaryEntries,
            'total_learning_materials' => $totalLearningMaterials,
            'top_user' => $topUser ? [
                'name' => $topUser['user']->name,
                'total_score' => $topUser['total_score'],
                'bonus_points' => $topUser['bonus_points'],
            ] : null,
        ];
    }

    /**
     * Get user demographics
     */
    private function getUserDemographics(): array
    {
        $users = User::where('role', 'user')->get();

        $genderCounts = [
            'Male' => $users->where('gender', 'Male')->count(),
            'Female' => $users->where('gender', 'Female')->count(),
            'Other' => $users->where('gender', null)->count() + $users->where('gender', '!=', 'Male')->where('gender', '!=', 'Female')->count(),
        ];

        $ageGroups = [
            'Year 1 (7)' => $users->where('age', 7)->count(),
            'Year 2 (8)' => $users->where('age', 8)->count(),
            'Year 3 (9)' => $users->where('age', 9)->count(),
            'Year 4 (10)' => $users->where('age', 10)->count(),
            'Year 5 (11)' => $users->where('age', 11)->count(),
            'Year 6 (12)' => $users->where('age', 12)->count(),
        ];

        $averageAge = $users->pluck('age')->filter()->avg();

        return [
            'gender_distribution' => $genderCounts,
            'age_groups' => $ageGroups,
            'average_age' => $averageAge ? round($averageAge, 2) : 0,
            'total_users' => $users->count(),
        ];
    }

    /**
     * Get quiz activity metrics
     */
    private function getQuizActivity(): array
    {
        $quizzes = Quiz::with('quizAttempts')->get();

        // Most popular quiz (by attempts)
        $mostPopular = $quizzes
            ->sortByDesc(fn($quiz) => $quiz->quizAttempts->count())
            ->first();

        // Quiz with highest average score
        $quizzesByAvgScore = $quizzes->map(function ($quiz) {
            $attempts = $quiz->quizAttempts;
            if ($attempts->count() === 0) {
                return ['quiz' => $quiz, 'avg_score' => 0];
            }
            $avgScore = $attempts->avg('marks_obtained');
            return ['quiz' => $quiz, 'avg_score' => $avgScore];
        });

        $highestAvgScore = $quizzesByAvgScore->sortByDesc('avg_score')->first();

        return [
            'total_quizzes' => $quizzes->count(),
            'most_popular_quiz' => $mostPopular ? [
                'title' => $mostPopular->title,
                'attempts' => $mostPopular->quizAttempts->count(),
            ] : null,
            'highest_pass_rate_quiz' => $highestAvgScore ? [
                'title' => $highestAvgScore['quiz']->title,
                'pass_rate' => round($highestAvgScore['avg_score'], 2),
            ] : null,
        ];
    }

    /**
     * Get feedback summary
     */
    private function getFeedbackSummary(): array
    {
        $feedbacks = Feedback::all();

        if ($feedbacks->count() === 0) {
            return [
                'total_feedback' => 0,
                'average_ratings' => [
                    'ease_of_use' => 0,
                    'learned_words' => 0,
                    'quiz_fun' => 0,
                    'virtual_tour' => 0,
                ],
            ];
        }

        $averageRatings = [
            'ease_of_use' => round($this->convertFeedbackToNumeric($feedbacks, 'ease_of_use'), 2),
            'learned_words' => round($this->convertFeedbackToNumeric($feedbacks, 'learned_words'), 2),
            'quiz_fun' => round($this->convertFeedbackToNumeric($feedbacks, 'quiz_fun'), 2),
            'virtual_tour' => round($this->convertFeedbackToNumeric($feedbacks, 'virtual_tour'), 2),
        ];

        return [
            'total_feedback' => $feedbacks->count(),
            'average_ratings' => $averageRatings,
        ];
    }

    /**
     * Get recent activity (last 5 of each)
     */
    private function getRecentActivity(): array
    {
        // Latest feedbacks
        $recentFeedbacks = Feedback::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($f) => [
                'user_name' => $f->user?->name ?? 'Unknown',
                'ease_of_use' => $this->mapResponseToRating($f->ease_of_use),
                'created_at' => $f->created_at->format('Y-m-d H:i'),
            ]);

        // New users this month
        $newUsersThisMonth = User::where('role', 'user')
            ->where('created_at', '>=', Carbon::now()->startOfMonth())
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($u) => [
                'name' => $u->name,
                'email' => $u->email,
                'created_at' => $u->created_at->format('Y-m-d'),
            ]);

        // Recent quizzes
        $recentQuizzes = Quiz::latest()
            ->take(5)
            ->get()
            ->map(fn($q) => [
                'title' => $q->title,
                'category' => $q->category,
                'created_at' => $q->created_at->format('Y-m-d'),
            ]);

        return [
            'recent_feedbacks' => $recentFeedbacks,
            'new_users_this_month' => $newUsersThisMonth,
            'recent_quizzes' => $recentQuizzes,
        ];
    }

    /**
     * Get top 5 users
     */
    private function getTopPerformers(): array
    {
        $users = User::where('role', 'user')
            ->with('quizAttempts')
            ->get()
            ->map(function ($user) {
                $totalScore = $user->quizAttempts->sum('marks_obtained');
                $bonusPoints = BonusPoints::where('user_id', $user->id)->sum('points') ?? 0;
                return [
                    'name' => $user->name,
                    'total_score' => $totalScore,
                    'bonus_points' => $bonusPoints,
                    'quiz_count' => $user->quizAttempts->count(),
                ];
            })
            ->sortByDesc('total_score')
            ->take(5)
            ->values();

        return $users->map(function ($user, $index) {
            $user['rank'] = $index + 1;
            return $user;
        })->toArray();
    }

    /**
     * Get bonus points info
     */
    private function getBonusPointsInfo(): array
    {
        $bonusStats = BonusPoints::selectRaw('COUNT(*) as total_awards, SUM(points) as total_points')
            ->first();

        return [
            'total_awards' => $bonusStats->total_awards ?? 0,
            'total_points_awarded' => $bonusStats->total_points ?? 0,
        ];
    }

    /**
     * Get dictionary status
     */
    private function getDictionaryStatus(): array
    {
        $entries = DictionaryEntry::all();
        $totalEntries = $entries->count();

        if ($totalEntries === 0) {
            return [
                'total_entries' => 0,
                'completeness_percentage' => 0,
                'languages' => [],
            ];
        }

        // Check completeness (has dusun word, bm translation, en translation, example)
        $complete = $entries->filter(function ($entry) {
            return !empty($entry->dusun_word) &&
                   !empty($entry->bm_translation) &&
                   !empty($entry->en_translation) &&
                   !empty($entry->example);
        })->count();

        $completenessPercentage = ($complete / $totalEntries) * 100;

        // Language coverage
        $languages = [
            'Dusun' => $entries->filter(fn($e) => !empty($e->dusun_word))->count(),
            'Malay' => $entries->filter(fn($e) => !empty($e->bm_translation))->count(),
            'English' => $entries->filter(fn($e) => !empty($e->en_translation))->count(),
        ];

        return [
            'total_entries' => $totalEntries,
            'completeness_percentage' => round($completenessPercentage, 2),
            'complete_entries' => $complete,
            'languages' => $languages,
        ];
    }

    /**
     * Convert feedback string responses to numeric ratings
     */
    private function mapResponseToRating(string $response): int
    {
        $englishMappings = [
            'Yes' => 5,
            'A little' => 3,
            'No' => 1,
            'Okay' => 3,
            'Hard' => 1,
            'Kind of' => 3,
            'Not really' => 1,
        ];

        $malayMappings = [
            'Ya' => 5,
            'Sedikit' => 3,
            'Tidak' => 1,
            'Boleh lah' => 3,
            'Susah' => 1,
            'Biasa saja' => 3,
            'Tidak sangat' => 1,
        ];

        return $englishMappings[$response] ?? $malayMappings[$response] ?? 0;
    }

    /**
     * Calculate average numeric rating for a feedback field
     */
    private function convertFeedbackToNumeric($feedbacks, string $field): float
    {
        $ratings = $feedbacks->pluck($field)
            ->map(fn($response) => $this->mapResponseToRating($response))
            ->filter(fn($rating) => $rating > 0);

        return $ratings->count() > 0 ? $ratings->avg() : 0;
    }
}
