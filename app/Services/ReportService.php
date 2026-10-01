<?php

namespace App\Services;

use App\Models\User;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Feedback;
use App\Models\DictionaryEntry;
use App\Models\LeaderboardHistory;
use App\Models\BonusPoints;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ReportService
{
    /**
     * Generate Quiz Performance Report
     */
    public function generateQuizPerformanceReport(): array
    {
        $quizzes = Quiz::with('questions')->get();

        $quizData = $quizzes->map(function ($quiz) {
            $attempts = QuizAttempt::where('quiz_id', $quiz->id)->get();
            $totalAttempts = $attempts->count();
            $averageScore = $totalAttempts > 0 ? $attempts->avg('marks_obtained') : 0;
            $passRate = $totalAttempts > 0 ? ($attempts->where('marks_obtained', '>=', $quiz->total_marks * 0.5)->count() / $totalAttempts * 100) : 0;

            return [
                'quiz_id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'category' => $quiz->category,
                'total_marks' => $quiz->total_marks,
                'question_count' => $quiz->questions->count(),
                'total_attempts' => $totalAttempts,
                'average_score' => round($averageScore, 2),
                'pass_rate' => round($passRate, 2),
                'is_available' => $quiz->is_available,
            ];
        })->sortByDesc('total_attempts')->values();

        $stats = [
            'total_quizzes' => $quizzes->count(),
            'total_questions' => $quizzes->sum(fn($q) => $q->questions->count()),
            'total_attempts' => QuizAttempt::count(),
            'average_attempt_score' => round(QuizAttempt::avg('marks_obtained'), 2),
        ];

        return [
            'quizzes' => $quizData,
            'stats' => $stats,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Generate User Engagement Report
     */
    public function generateUserEngagementReport(): array
    {
        $allUsers = User::where('role', 'user')->get();
        $totalUsers = $allUsers->count();

        // User registration trends (last 30 days)
        $registrationTrend = User::where('role', 'user')
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Active users (users with quiz attempts in last 30 days)
        $activeUserIds = QuizAttempt::where('attempted_at', '>=', now()->subDays(30))
            ->pluck('user_id')
            ->unique();
        $activeUsers = $activeUserIds->count();

        // Inactive users (no quiz attempts)
        $inactiveUsers = User::where('role', 'user')
            ->whereNotIn('id', QuizAttempt::pluck('user_id')->unique())
            ->count();

        // Demographics
        $maleCount = $allUsers->where('gender', 'Male')->count();
        $femaleCount = $allUsers->where('gender', 'Female')->count();
        $otherCount = $totalUsers - $maleCount - $femaleCount;

        // Age groups (Year 1-6 for primary school)
        $ageGroups = [
            'year_1' => $allUsers->where('age', 7)->count(),
            'year_2' => $allUsers->where('age', 8)->count(),
            'year_3' => $allUsers->where('age', 9)->count(),
            'year_4' => $allUsers->where('age', 10)->count(),
            'year_5' => $allUsers->where('age', 11)->count(),
            'year_6' => $allUsers->where('age', 12)->count(),
        ];

        // Average age
        $averageAge = round($allUsers->avg('age'), 2);

        return [
            'total_users' => $totalUsers,
            'active_users_30days' => $activeUsers,
            'inactive_users' => $inactiveUsers,
            'registration_trend' => $registrationTrend,
            'demographics' => [
                'male' => $maleCount,
                'female' => $femaleCount,
                'other' => $otherCount,
            ],
            'age_groups' => $ageGroups,
            'average_age' => $averageAge,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Generate Feedback Summary Report
     */
    public function generateFeedbackSummaryReport(): array
    {
        $feedbacks = Feedback::with('user')->get();
        $totalFeedback = $feedbacks->count();

        if ($totalFeedback === 0) {
            return [
                'total_feedback' => 0,
                'average_ratings' => [
                    'ease_of_use' => 0,
                    'learned_words' => 0,
                    'quiz_fun' => 0,
                    'virtual_tour' => 0,
                ],
                'feedback_by_language' => [],
                'rating_distribution' => [],
                'featured_feedback' => [],
                'generated_at' => now()->format('Y-m-d H:i:s'),
            ];
        }

        // Calculate averages by converting string responses to numeric ratings
        $averageRatings = [
            'ease_of_use' => round($this->convertFeedbackToNumeric($feedbacks, 'ease_of_use'), 2),
            'learned_words' => round($this->convertFeedbackToNumeric($feedbacks, 'learned_words'), 2),
            'quiz_fun' => round($this->convertFeedbackToNumeric($feedbacks, 'quiz_fun'), 2),
            'virtual_tour' => round($this->convertFeedbackToNumeric($feedbacks, 'virtual_tour'), 2),
        ];

        // Feedback by language
        $feedbackByLanguage = $feedbacks->groupBy('language')->map(function ($group) {
            return $group->count();
        })->toArray();

        // Rating distribution (1-5 scale) - convert string responses to numeric and count
        $allRatings = collect();
        foreach ($feedbacks as $feedback) {
            $allRatings->push($this->mapResponseToRating($feedback->ease_of_use));
            $allRatings->push($this->mapResponseToRating($feedback->learned_words));
            $allRatings->push($this->mapResponseToRating($feedback->quiz_fun));
            $allRatings->push($this->mapResponseToRating($feedback->virtual_tour));
        }
        $ratingDistribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $count = $allRatings->where($i)->count();
            if ($count > 0) {
                $ratingDistribution[$i] = $count;
            }
        }

        // Featured feedback (most recent with non-empty improvements/favorite_part)
        $featuredFeedback = $feedbacks
            ->filter(fn($f) => !empty($f->favourite_part) || !empty($f->improvements))
            ->sortByDesc('created_at')
            ->take(5)
            ->map(fn($f) => [
                'user_name' => $f->user?->name ?? 'Unknown',
                'language' => $f->language,
                'favourite_part' => $f->favourite_part,
                'improvements' => $f->improvements,
                'ratings' => [
                    'ease_of_use' => $this->mapResponseToRating($f->ease_of_use),
                    'learned_words' => $this->mapResponseToRating($f->learned_words),
                    'quiz_fun' => $this->mapResponseToRating($f->quiz_fun),
                    'virtual_tour' => $this->mapResponseToRating($f->virtual_tour),
                ],
                'created_at' => $f->created_at->format('Y-m-d'),
            ])
            ->values();

        // All feedback with converted ratings for detailed table display
        $allFeedback = $feedbacks->map(fn($f) => [
            'user_name' => $f->user?->name ?? 'Unknown',
            'language' => $f->language,
            'ease_of_use' => $this->mapResponseToRating($f->ease_of_use),
            'learned_words' => $this->mapResponseToRating($f->learned_words),
            'quiz_fun' => $this->mapResponseToRating($f->quiz_fun),
            'virtual_tour' => $this->mapResponseToRating($f->virtual_tour),
            'favourite_part' => $f->favourite_part,
            'improvements' => $f->improvements,
            'created_at' => $f->created_at->format('Y-m-d'),
        ])->values();

        return [
            'total_feedback' => $totalFeedback,
            'average_ratings' => $averageRatings,
            'feedback_by_language' => $feedbackByLanguage,
            'rating_distribution' => $ratingDistribution,
            'featured_feedback' => $featuredFeedback,
            'all_feedback' => $allFeedback,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Generate Leaderboard Performance Report
     */
    public function generateLeaderboardPerformanceReport(): array
    {
        // Current leaderboard
        $leaderboard = User::where('role', 'user')
            ->with('quizAttempts', 'bonusPointsReceived')
            ->get()
            ->map(function ($user) {
                $totalMarks = $user->quizAttempts->sum('marks_obtained');
                $bonusPoints = $user->bonusPointsReceived->sum('points');
                $totalScore = $totalMarks + $bonusPoints;

                return [
                    'user_id' => $user->user_id,
                    'name' => $user->name,
                    'total_marks' => $totalMarks,
                    'bonus_points' => $bonusPoints,
                    'total_score' => $totalScore,
                    'quiz_count' => $user->quizAttempts->count(),
                    'average_score' => $user->quizAttempts->count() > 0
                        ? round($user->quizAttempts->avg('marks_obtained'), 2)
                        : 0,
                ];
            })
            ->sortByDesc('total_score')
            ->values();

        // Add rank
        $leaderboard = $leaderboard->map(function ($item, $index) {
            $item['rank'] = $index + 1;
            return $item;
        });

        // Top 10 performers
        $topPerformers = $leaderboard->take(10);

        // Bonus points statistics
        $bonusPointsStats = BonusPoints::selectRaw('COUNT(*) as total_awards, SUM(points) as total_points, COUNT(DISTINCT admin_id) as admin_count')
            ->first();

        return [
            'total_users' => $leaderboard->count(),
            'leaderboard' => $leaderboard,
            'top_performers' => $topPerformers,
            'bonus_points_stats' => [
                'total_awards' => $bonusPointsStats->total_awards ?? 0,
                'total_points_awarded' => $bonusPointsStats->total_points ?? 0,
                'admins_awarding_points' => $bonusPointsStats->admin_count ?? 0,
            ],
            'highest_score' => $leaderboard->first()['total_score'] ?? 0,
            'average_score' => round($leaderboard->pluck('total_score')->filter(fn($v) => $v !== null)->avg() ?? 0, 2),
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Generate Dictionary Coverage Report
     */
    public function generateDictionaryCoverageReport(): array
    {
        $entries = DictionaryEntry::all();
        $totalEntries = $entries->count();

        if ($totalEntries === 0) {
            return [
                'total_entries' => 0,
                'completeness_stats' => [],
                'entries_with_media' => 0,
                'coverage_by_language' => [],
                'incomplete_entries' => [],
                'generated_at' => now()->format('Y-m-d H:i:s'),
            ];
        }

        // Completeness check
        $entriesWithAllFields = $entries->filter(fn($e) => !empty($e->dusun_word) && !empty($e->bm_translation) && !empty($e->en_translation) && !empty($e->pronunciation))->count();
        $entriesWithExamples = $entries->filter(fn($e) => !empty($e->dusun_example_sentence) && !empty($e->bm_example_translation) && !empty($e->en_example_translation))->count();
        $entriesWithPictures = $entries->filter(fn($e) => !empty($e->word_picture))->count();

        $completenessStats = [
            'all_languages' => round(($entriesWithAllFields / $totalEntries) * 100, 2),
            'with_examples' => round(($entriesWithExamples / $totalEntries) * 100, 2),
            'with_pictures' => round(($entriesWithPictures / $totalEntries) * 100, 2),
        ];

        // Entries missing translations
        $incompleteEntries = $entries
            ->filter(fn($e) => empty($e->dusun_word) || empty($e->bm_translation) || empty($e->en_translation))
            ->map(fn($e) => [
                'entry_id' => $e->entry_id,
                'dusun_word' => $e->dusun_word ?? '[MISSING]',
                'bm_translation' => $e->bm_translation ?? '[MISSING]',
                'en_translation' => $e->en_translation ?? '[MISSING]',
                'has_picture' => !empty($e->word_picture),
            ])
            ->take(10)
            ->values();

        return [
            'total_entries' => $totalEntries,
            'completeness_stats' => $completenessStats,
            'entries_with_media' => $entriesWithPictures,
            'coverage_by_language' => [
                'dusun' => $entries->where('dusun_word', '!=', null)->count(),
                'bm' => $entries->where('bm_translation', '!=', null)->count(),
                'english' => $entries->where('en_translation', '!=', null)->count(),
            ],
            'incomplete_entries' => $incompleteEntries,
            'recent_additions' => $entries
                ->sortByDesc('created_at')
                ->take(5)
                ->map(fn($e) => [
                    'dusun_word' => $e->dusun_word,
                    'created_at' => $e->created_at->format('Y-m-d'),
                ])
                ->values(),
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Generate HTML for printing/exporting
     */
    public function generateReportHtml(string $reportType, array $data): string
    {
        return match($reportType) {
            'quiz_performance' => $this->generateQuizPerformanceHtml($data),
            'user_engagement' => $this->generateUserEngagementHtml($data),
            'feedback_summary' => $this->generateFeedbackSummaryHtml($data),
            'leaderboard_performance' => $this->generateLeaderboardPerformanceHtml($data),
            'dictionary_coverage' => $this->generateDictionaryCoverageHtml($data),
            default => '',
        };
    }

    /**
     * Generate Quiz Performance HTML
     */
    private function generateQuizPerformanceHtml(array $data): string
    {
        $quizzes = $data['quizzes'];
        $stats = $data['stats'];
        $generatedAt = $data['generated_at'];

        $quizRows = $quizzes->map(function($quiz) {
            return <<<HTML
            <tr>
                <td>{$quiz['quiz_id']}</td>
                <td>{$quiz['title']}</td>
                <td>{$quiz['category']}</td>
                <td>{$quiz['question_count']}</td>
                <td>{$quiz['total_marks']}</td>
                <td>{$quiz['total_attempts']}</td>
                <td>{$quiz['average_score']}</td>
                <td>{$quiz['pass_rate']}%</td>
            </tr>
        HTML;
        })->implode('');

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Quiz Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        h1 { color: #1a1a1a; border-bottom: 3px solid #f0b429; padding-bottom: 10px; }
        .report-header { margin-bottom: 20px; }
        .report-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .report-info p { margin: 5px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-box { background-color: #e8f0ff; border-left: 4px solid #4a90e2; padding: 15px; border-radius: 3px; }
        .stat-label { color: #666; font-size: 12px; text-transform: uppercase; }
        .stat-value { font-size: 24px; font-weight: bold; color: #4a90e2; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        thead { background-color: #4a90e2; color: white; }
        th { padding: 12px; text-align: left; font-weight: bold; }
        td { padding: 10px 12px; border-bottom: 1px solid #ddd; }
        tbody tr:nth-child(even) { background-color: #f9f9f9; }
        tbody tr:hover { background-color: #f0f0f0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>📊 Quiz Performance Report</h1>
        <div class="report-info">
            <p><strong>Report Generated:</strong> {$generatedAt}</p>
            <p><strong>Report Type:</strong> Complete Quiz Performance Analysis</p>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-box">
            <div class="stat-label">Total Quizzes</div>
            <div class="stat-value">{$stats['total_quizzes']}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Total Questions</div>
            <div class="stat-value">{$stats['total_questions']}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Total Attempts</div>
            <div class="stat-value">{$stats['total_attempts']}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Avg Score</div>
            <div class="stat-value">{$stats['average_attempt_score']}</div>
        </div>
    </div>

    <h2>Quiz Details</h2>
    <table>
        <thead>
            <tr>
                <th>Quiz ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Questions</th>
                <th>Total Marks</th>
                <th>Attempts</th>
                <th>Avg Score</th>
                <th>Pass Rate</th>
            </tr>
        </thead>
        <tbody>
            {$quizRows}
        </tbody>
    </table>

    <div class="footer">
        <p>This report was automatically generated by TanganakDusun Admin Panel</p>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Generate User Engagement HTML
     */
    private function generateUserEngagementHtml(array $data): string
    {
        $generatedAt = $data['generated_at'];
        $totalUsers = $data['total_users'];
        $activeUsers = $data['active_users_30days'];
        $inactiveUsers = $data['inactive_users'];
        $demographics = $data['demographics'];
        $ageGroups = $data['age_groups'];
        $averageAge = $data['average_age'];

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>User Engagement Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        h1 { color: #1a1a1a; border-bottom: 3px solid #f0b429; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; }
        .report-header { margin-bottom: 20px; }
        .report-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .report-info p { margin: 5px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-box { background-color: #e8f0ff; border-left: 4px solid #4a90e2; padding: 15px; border-radius: 3px; }
        .stat-label { color: #666; font-size: 12px; text-transform: uppercase; }
        .stat-value { font-size: 24px; font-weight: bold; color: #4a90e2; margin-top: 5px; }
        .chart-container { margin-bottom: 30px; }
        .chart-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .chart-bar { display: flex; align-items: center; width: 100%; }
        .bar-label { width: 150px; font-weight: bold; }
        .bar { background: linear-gradient(90deg, #4a90e2, #357abd); height: 30px; border-radius: 3px; display: flex; align-items: center; color: white; padding: 0 10px; }
        .bar-value { margin-left: 10px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        thead { background-color: #4a90e2; color: white; }
        th { padding: 12px; text-align: left; font-weight: bold; }
        td { padding: 10px 12px; border-bottom: 1px solid #ddd; }
        tbody tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>👥 User Engagement Report</h1>
        <div class="report-info">
            <p><strong>Report Generated:</strong> {$generatedAt}</p>
            <p><strong>Report Type:</strong> User Registration & Engagement Analysis</p>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-box">
            <div class="stat-label">Total Users</div>
            <div class="stat-value">{$totalUsers}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Active (30 days)</div>
            <div class="stat-value">{$activeUsers}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Inactive Users</div>
            <div class="stat-value">{$inactiveUsers}</div>
        </div>
    </div>

    <h2>Demographics</h2>
    <div class="chart-container">
        <div class="chart-row">
            <div class="chart-bar">
                <div class="bar-label">Male</div>
                <div class="bar" style="width: {$demographics['male']}px;">
                    {$demographics['male']}
                </div>
            </div>
        </div>
        <div class="chart-row">
            <div class="chart-bar">
                <div class="bar-label">Female</div>
                <div class="bar" style="width: {$demographics['female']}px;">
                    {$demographics['female']}
                </div>
            </div>
        </div>
        <div class="chart-row">
            <div class="chart-bar">
                <div class="bar-label">Other</div>
                <div class="bar" style="width: {$demographics['other']}px;">
                    {$demographics['other']}
                </div>
            </div>
        </div>
    </div>

    <h2>Age Groups</h2>
    <table>
        <thead>
            <tr>
                <th>Age Group</th>
                <th>User Count</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Year 1 (7 years old)</td>
                <td>{$ageGroups['year_1']}</td>
            </tr>
            <tr>
                <td>Year 2 (8 years old)</td>
                <td>{$ageGroups['year_2']}</td>
            </tr>
            <tr>
                <td>Year 3 (9 years old)</td>
                <td>{$ageGroups['year_3']}</td>
            </tr>
            <tr>
                <td>Year 4 (10 years old)</td>
                <td>{$ageGroups['year_4']}</td>
            </tr>
            <tr>
                <td>Year 5 (11 years old)</td>
                <td>{$ageGroups['year_5']}</td>
            </tr>
            <tr>
                <td>Year 6 (12 years old)</td>
                <td>{$ageGroups['year_6']}</td>
            </tr>
            <tr style="font-weight: bold; background-color: #e8f0ff;">
                <td>Average Age</td>
                <td>{$averageAge} years</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>This report was automatically generated by TanganakDusun Admin Panel</p>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Generate Feedback Summary HTML
     */
    private function generateFeedbackSummaryHtml(array $data): string
    {
        $generatedAt = $data['generated_at'];
        $totalFeedback = $data['total_feedback'];
        $averageRatings = $data['average_ratings'];
        $feedbackByLanguage = $data['feedback_by_language'];
        $featuredFeedback = $data['featured_feedback'];

        $languageRows = collect($feedbackByLanguage)->map(function($count, $lang) {
            return <<<HTML
            <tr>
                <td>{$lang}</td>
                <td>{$count}</td>
            </tr>
        HTML;
        })->implode('');

        $feedbackRows = $featuredFeedback->map(function($fb) {
            return <<<HTML
            <tr>
                <td>{$fb['user_name']}</td>
                <td>{$fb['language']}</td>
                <td>{$fb['ratings']['ease_of_use']}</td>
                <td>{$fb['ratings']['learned_words']}</td>
                <td>{$fb['ratings']['quiz_fun']}</td>
                <td>{$fb['ratings']['virtual_tour']}</td>
            </tr>
        HTML;
        })->implode('');

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Feedback Summary Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        h1 { color: #1a1a1a; border-bottom: 3px solid #f0b429; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; }
        .report-header { margin-bottom: 20px; }
        .report-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .report-info p { margin: 5px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-box { background-color: #fff4e6; border-left: 4px solid #f0b429; padding: 15px; border-radius: 3px; }
        .stat-label { color: #666; font-size: 12px; text-transform: uppercase; }
        .stat-value { font-size: 24px; font-weight: bold; color: #f0b429; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        thead { background-color: #f0b429; color: #1a1a1a; }
        th { padding: 12px; text-align: left; font-weight: bold; }
        td { padding: 10px 12px; border-bottom: 1px solid #ddd; }
        tbody tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>⭐ Feedback Summary Report</h1>
        <div class="report-info">
            <p><strong>Report Generated:</strong> {$generatedAt}</p>
            <p><strong>Total Feedback Responses:</strong> {$totalFeedback}</p>
        </div>
    </div>

    <h2>Average Ratings</h2>
    <div class="stats-grid">
        <div class="stat-box">
            <div class="stat-label">Ease of Use</div>
            <div class="stat-value">{$averageRatings['ease_of_use']}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Learned Words</div>
            <div class="stat-value">{$averageRatings['learned_words']}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Quiz Fun</div>
            <div class="stat-value">{$averageRatings['quiz_fun']}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Virtual Tour</div>
            <div class="stat-value">{$averageRatings['virtual_tour']}</div>
        </div>
    </div>

    <h2>Feedback by Language</h2>
    <table>
        <thead>
            <tr>
                <th>Language</th>
                <th>Count</th>
            </tr>
        </thead>
        <tbody>
            {$languageRows}
        </tbody>
    </table>

    <h2>Featured Feedback</h2>
    <table>
        <thead>
            <tr>
                <th>User</th>
                <th>Language</th>
                <th>Ease</th>
                <th>Words</th>
                <th>Fun</th>
                <th>VR Tour</th>
            </tr>
        </thead>
        <tbody>
            {$feedbackRows}
        </tbody>
    </table>

    <div class="footer">
        <p>This report was automatically generated by TanganakDusun Admin Panel</p>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Generate Leaderboard Performance HTML
     */
    private function generateLeaderboardPerformanceHtml(array $data): string
    {
        $generatedAt = $data['generated_at'];
        $totalUsers = $data['total_users'];
        $topPerformers = $data['top_performers'];
        $bonusStats = $data['bonus_points_stats'];
        $highestScore = $data['highest_score'];
        $averageScore = $data['average_score'];

        $leaderboardRows = $topPerformers->map(function($user) {
            $rankColor = $this->getRankColor($user['rank']);
            return <<<HTML
            <tr>
                <td style="font-weight: bold; color: {$rankColor}">#{$user['rank']}</td>
                <td>{$user['name']}</td>
                <td>{$user['total_score']}</td>
                <td>{$user['total_marks']}</td>
                <td>{$user['bonus_points']}</td>
                <td>{$user['quiz_count']}</td>
            </tr>
        HTML;
        })->implode('');

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Leaderboard Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        h1 { color: #1a1a1a; border-bottom: 3px solid #f0b429; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; }
        .report-header { margin-bottom: 20px; }
        .report-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .report-info p { margin: 5px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-box { background-color: #fff9e6; border-left: 4px solid #ffd700; padding: 15px; border-radius: 3px; }
        .stat-label { color: #666; font-size: 12px; text-transform: uppercase; }
        .stat-value { font-size: 24px; font-weight: bold; color: #b8860b; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        thead { background-color: #ffd700; color: #1a1a1a; }
        th { padding: 12px; text-align: left; font-weight: bold; }
        td { padding: 10px 12px; border-bottom: 1px solid #ddd; }
        tbody tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>🏆 Leaderboard Performance Report</h1>
        <div class="report-info">
            <p><strong>Report Generated:</strong> {$generatedAt}</p>
            <p><strong>Report Type:</strong> Top Performers & Ranking Analysis</p>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-box">
            <div class="stat-label">Total Users</div>
            <div class="stat-value">{$totalUsers}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Highest Score</div>
            <div class="stat-value">{$highestScore}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Average Score</div>
            <div class="stat-value">{$averageScore}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Total Awards</div>
            <div class="stat-value">{$bonusStats['total_awards']}</div>
        </div>
    </div>

    <h2>Top 10 Performers</h2>
    <table>
        <thead>
            <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Total Score</th>
                <th>Quiz Marks</th>
                <th>Bonus Points</th>
                <th>Quizzes Taken</th>
            </tr>
        </thead>
        <tbody>
            {$leaderboardRows}
        </tbody>
    </table>

    <h2>Bonus Points Statistics</h2>
    <table>
        <tbody>
            <tr>
                <td><strong>Total Awards Given</strong></td>
                <td>{$bonusStats['total_awards']}</td>
            </tr>
            <tr>
                <td><strong>Total Points Awarded</strong></td>
                <td>{$bonusStats['total_points_awarded']}</td>
            </tr>
            <tr>
                <td><strong>Admins Awarding Points</strong></td>
                <td>{$bonusStats['admins_awarding_points']}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>This report was automatically generated by TanganakDusun Admin Panel</p>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Generate Dictionary Coverage HTML
     */
    private function generateDictionaryCoverageHtml(array $data): string
    {
        $generatedAt = $data['generated_at'];
        $totalEntries = $data['total_entries'];
        $completeness = $data['completeness_stats'];
        $coverage = $data['coverage_by_language'];
        $incompleteEntries = $data['incomplete_entries'];

        $incompleteRows = $incompleteEntries->map(function($entry) {
            $picture = $entry['has_picture'] ? '✓' : '-';
            return <<<HTML
            <tr>
                <td>{$entry['entry_id']}</td>
                <td>{$entry['dusun_word']}</td>
                <td>{$entry['bm_translation']}</td>
                <td>{$entry['en_translation']}</td>
                <td>{$picture}</td>
            </tr>
        HTML;
        })->implode('');

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Dictionary Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        h1 { color: #1a1a1a; border-bottom: 3px solid #f0b429; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; }
        .report-header { margin-bottom: 20px; }
        .report-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .report-info p { margin: 5px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-box { background-color: #e6f3ff; border-left: 4px solid #0066cc; padding: 15px; border-radius: 3px; }
        .stat-label { color: #666; font-size: 12px; text-transform: uppercase; }
        .stat-value { font-size: 24px; font-weight: bold; color: #0066cc; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        thead { background-color: #0066cc; color: white; }
        th { padding: 12px; text-align: left; font-weight: bold; }
        td { padding: 10px 12px; border-bottom: 1px solid #ddd; }
        tbody tr:nth-child(even) { background-color: #f9f9f9; }
        .progress-bar { height: 20px; background-color: #ddd; border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; background-color: #0066cc; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>📚 Dictionary Coverage Report</h1>
        <div class="report-info">
            <p><strong>Report Generated:</strong> {$generatedAt}</p>
            <p><strong>Total Entries:</strong> {$totalEntries}</p>
        </div>
    </div>

    <h2>Completeness Statistics</h2>
    <div class="stats-grid">
        <div class="stat-box">
            <div class="stat-label">All Languages Complete</div>
            <div class="stat-value">{$completeness['all_languages']}%</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: {$completeness['all_languages']}%;"></div>
            </div>
        </div>
        <div class="stat-box">
            <div class="stat-label">With Examples</div>
            <div class="stat-value">{$completeness['with_examples']}%</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: {$completeness['with_examples']}%;"></div>
            </div>
        </div>
        <div class="stat-box">
            <div class="stat-label">With Pictures</div>
            <div class="stat-value">{$completeness['with_pictures']}%</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: {$completeness['with_pictures']}%;"></div>
            </div>
        </div>
    </div>

    <h2>Language Coverage</h2>
    <table>
        <thead>
            <tr>
                <th>Language</th>
                <th>Entries With Translation</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Dusun Words</td>
                <td>{$coverage['dusun']}</td>
            </tr>
            <tr>
                <td>Bahasa Melayu Translations</td>
                <td>{$coverage['bm']}</td>
            </tr>
            <tr>
                <td>English Translations</td>
                <td>{$coverage['english']}</td>
            </tr>
        </tbody>
    </table>

    {$this->getIncompleteEntriesSection($incompleteRows)}

    <div class="footer">
        <p>This report was automatically generated by TanganakDusun Admin Panel</p>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Get incomplete entries section HTML
     */
    private function getIncompleteEntriesSection(string $incompleteRows): string
    {
        if (empty($incompleteRows)) {
            return '<h2>Incomplete Entries</h2><p>All dictionary entries are complete! ✓</p>';
        }

        return <<<HTML
    <h2>Sample Incomplete Entries (Top 10)</h2>
    <table>
        <thead>
            <tr>
                <th>Entry ID</th>
                <th>Dusun Word</th>
                <th>BM Translation</th>
                <th>EN Translation</th>
                <th>Has Picture</th>
            </tr>
        </thead>
        <tbody>
            {$incompleteRows}
        </tbody>
    </table>
HTML;
    }

    /**
     * Convert feedback string responses to numeric ratings (1-5 scale)
     */
    private function mapResponseToRating(string $response): int
    {
        // Map English responses
        $englishMappings = [
            'Yes' => 5,
            'A little' => 3,
            'No' => 1,
            'Okay' => 3,
            'Hard' => 1,
            'Kind of' => 3,
            'Not really' => 1,
        ];

        // Map Malay (Bahasa Melayu) responses
        $malayMappings = [
            'Ya' => 5,
            'Sedikit' => 3,
            'Tidak' => 1,
            'Boleh lah' => 3,
            'Susah' => 1,
            'Biasa saja' => 3,
            'Tidak sangat' => 1,
        ];

        // Check English mappings first, then Malay
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

    /**
     * Get color for rank badge
     */
    private function getRankColor(int $rank): string
    {
        return match($rank) {
            1 => '#FFD700',      // Gold
            2 => '#C0C0C0',      // Silver
            3 => '#CD7F32',      // Bronze
            default => '#333',
        };
    }
}
