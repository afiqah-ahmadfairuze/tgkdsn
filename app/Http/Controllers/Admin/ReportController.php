<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Inertia\Inertia;

class ReportController extends Controller
{
    private ReportService $reportService;

    /* Set up the report service when this controller starts */
    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /* Get the list of all available reports */
    public function index(): JsonResponse
    {
        /* List all the different reports the admin can generate */
        $reports = [
            [
                'id' => 'quiz_performance',
                'name' => 'Quiz Performance Report',
                'description' => 'Analyze quiz difficulty, attempt rates, pass rates, and student performance',
                'icon' => '📊',
                'category' => 'Learning Analytics',
            ],
            [
                'id' => 'user_engagement',
                'name' => 'User Engagement Report',
                'description' => 'Track user registrations, active users, demographics, and engagement trends',
                'icon' => '👥',
                'category' => 'User Analytics',
            ],
            [
                'id' => 'feedback_summary',
                'name' => 'Feedback Summary Report',
                'description' => 'View user satisfaction ratings, featured feedback, and improvement suggestions',
                'icon' => '⭐',
                'category' => 'User Feedback',
            ],
            [
                'id' => 'leaderboard_performance',
                'name' => 'Leaderboard Performance Report',
                'description' => 'Analyze top performers, bonus points distribution, and competitive engagement',
                'icon' => '🏆',
                'category' => 'Gamification',
            ],
            [
                'id' => 'dictionary_coverage',
                'name' => 'Dictionary Coverage Report',
                'description' => 'Check dictionary completeness, language translations, and content gaps',
                'icon' => '📚',
                'category' => 'Content Management',
            ],
        ];

        /* Send back the list of reports */
        return response()->json([
            'success' => true,
            'reports' => $reports,
        ]);
    }

    /* Generate a specific report */
    public function getReport(Request $request, string $reportType): JsonResponse
    {
        try {
            /* Generate the requested report using the report service */
            $reportData = match($reportType) {
                'quiz_performance' => $this->reportService->generateQuizPerformanceReport(),
                'user_engagement' => $this->reportService->generateUserEngagementReport(),
                'feedback_summary' => $this->reportService->generateFeedbackSummaryReport(),
                'leaderboard_performance' => $this->reportService->generateLeaderboardPerformanceReport(),
                'dictionary_coverage' => $this->reportService->generateDictionaryCoverageReport(),
                default => throw new \Exception('Invalid report type'),
            };

            /* Save the report data in the session */
            session(['report_data' => $reportData, 'report_type' => $reportType]);

            /* Send back the report data */
            return response()->json([
                'success' => true,
                'report_type' => $reportType,
                'data' => $reportData,
            ]);
        } catch (\Exception $e) {
            /* If something goes wrong, write it to the log */
            \Log::error('Error generating report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate report',
            ], 500);
        }
    }

    /* Generate a user report based on filters */
    public function generate(Request $request): JsonResponse
    {
        /* Clean up empty strings and turn them into null */
        $data = $request->all();
        \Log::info('Report generate request data:', $data);

        foreach (['month', 'start_date', 'end_date', 'age_filter', 'gender_filter'] as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        \Log::info('Report generate normalized data:', $data);

        /* Make sure the report filters are valid */
        $validator = \Illuminate\Support\Facades\Validator::make($data, [
            'report_type' => 'required|in:overall,monthly,custom',
            'month' => 'required_if:report_type,monthly|nullable|date_format:Y-m',
            'start_date' => 'required_if:report_type,custom|nullable|date_format:Y-m-d',
            'end_date' => 'required_if:report_type,custom|nullable|date_format:Y-m-d|after_or_equal:start_date',
            'age_filter' => 'nullable|integer|min:7|max:12',
            'gender_filter' => 'nullable|in:Male,Female',
        ]);

        if ($validator->fails()) {
            \Log::error('Report validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        /* Start building the query for users */
        $query = User::where('role', 'user');

        /* Apply date filters based on report type */
        switch ($validated['report_type']) {
            case 'overall':
                /* No date filter for overall report */
                break;
            case 'monthly':
                /* Filter by specific month */
                $month = Carbon::createFromFormat('Y-m', $validated['month']);
                $query->whereBetween('created_at', [
                    $month->startOfMonth(),
                    $month->endOfMonth(),
                ]);
                break;
            case 'custom':
                /* Filter by custom date range */
                $startDate = Carbon::createFromFormat('Y-m-d', $validated['start_date'])->startOfDay();
                $endDate = Carbon::createFromFormat('Y-m-d', $validated['end_date'])->endOfDay();
                $query->whereBetween('created_at', [$startDate, $endDate]);
                break;
        }

        /* Apply optional age and gender filters */
        if (!empty($validated['age_filter'])) {
            $query->where('age', $validated['age_filter']);
        }

        if (!empty($validated['gender_filter'])) {
            $query->where('gender', $validated['gender_filter']);
        }

        /* Get all the users that match the filters */
        $users = $query->orderBy('created_at', 'desc')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'user_id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'birthday' => $user->birthday ? $user->birthday->format('Y-m-d') : null,
                'age' => $user->age,
                'gender' => $user->gender,
                'guardian_fullname' => $user->guardian_fullname,
                'guardian_phone' => $user->guardian_phone,
                'guardian_email' => $user->guardian_email,
                'date_registered' => $user->created_at->format('Y-m-d H:i:s'),
            ];
        });

        /* Calculate statistics about the users */
        $stats = [
            'total_users' => $users->count(),
            'male_count' => $users->where('gender', 'Male')->count(),
            'female_count' => $users->where('gender', 'Female')->count(),
            'age_groups' => $this->calculateAgeGroups($users),
        ];

        /* Send back the report data */
        return response()->json([
            'success' => true,
            'users' => $users,
            'stats' => $stats,
            'report_criteria' => $validated,
        ]);
    }

    /* Count how many students are in each school year */
    private function calculateAgeGroups($users)
    {
        return [
            'year_1' => $users->where('age', 7)->count(),
            'year_2' => $users->where('age', 8)->count(),
            'year_3' => $users->where('age', 9)->count(),
            'year_4' => $users->where('age', 10)->count(),
            'year_5' => $users->where('age', 11)->count(),
            'year_6' => $users->where('age', 12)->count(),
        ];
    }

    /* Show the report page */
    public function view(Request $request)
    {
        /* Get the report data from the session */
        $users = session('report_users', []);
        $stats = session('report_stats', []);
        $criteria = session('report_criteria', []);

        /* Show the admin the report page */
        return Inertia::render('Admin/ReportView', [
            'users' => $users,
            'stats' => $stats,
            'criteria' => $criteria,
        ]);
    }

    /* Export the report as HTML for printing or saving */
    public function exportPdf(Request $request)
    {
        /* Clean up empty strings */
        $data = $request->all();
        \Log::info('Report exportPdf request data:', $data);

        foreach (['month', 'start_date', 'end_date', 'age_filter', 'gender_filter'] as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        \Log::info('Report exportPdf normalized data:', $data);

        /* Make sure the filters are valid */
        $validator = \Illuminate\Support\Facades\Validator::make($data, [
            'report_type' => 'required|in:overall,monthly,custom',
            'month' => 'required_if:report_type,monthly|nullable|date_format:Y-m',
            'start_date' => 'required_if:report_type,custom|nullable|date_format:Y-m-d',
            'end_date' => 'required_if:report_type,custom|nullable|date_format:Y-m-d|after_or_equal:start_date',
            'age_filter' => 'nullable|integer|min:7|max:12',
            'gender_filter' => 'nullable|in:Male,Female',
        ]);

        if ($validator->fails()) {
            \Log::error('PDF export validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        /* Build the query with filters (same as generate method) */
        $query = User::where('role', 'user');

        /* Apply date filters */
        switch ($validated['report_type']) {
            case 'overall':
                break;
            case 'monthly':
                $month = Carbon::createFromFormat('Y-m', $validated['month']);
                $query->whereBetween('created_at', [
                    $month->startOfMonth(),
                    $month->endOfMonth(),
                ]);
                break;
            case 'custom':
                $startDate = Carbon::createFromFormat('Y-m-d', $validated['start_date'])->startOfDay();
                $endDate = Carbon::createFromFormat('Y-m-d', $validated['end_date'])->endOfDay();
                $query->whereBetween('created_at', [$startDate, $endDate]);
                break;
        }

        /* Apply optional filters */
        if (!empty($validated['age_filter'])) {
            $query->where('age', $validated['age_filter']);
        }

        if (!empty($validated['gender_filter'])) {
            $query->where('gender', $validated['gender_filter']);
        }

        /* Get the users */
        $users = $query->orderBy('created_at', 'desc')->get();

        /* Create the filename */
        $reportType = $validated['report_type'];
        if ($reportType === 'monthly') {
            $dateStr = $validated['month'];
        } elseif ($reportType === 'custom') {
            $dateStr = $validated['start_date'] . '_to_' . $validated['end_date'];
        } else {
            $dateStr = date('Y-m-d');
        }

        $filename = "user_report_{$reportType}_{$dateStr}.html";

        /* Generate the HTML report */
        $html = $this->generateReportHtml($users, $validated);

        /* Send the HTML file as a download */
        return response($html)
            ->header('Content-Type', 'text/html; charset=utf-8')
            ->header('Content-Disposition', "attachment; filename=$filename");
    }

    /* Create the HTML table for the report */
    private function generateReportHtml($users, $criteria)
    {
        /* Get the report title and current date */
        $reportTitle = $this->getReportTitle($criteria);
        $generatedDate = date('Y-m-d H:i:s');

        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>$reportTitle</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        h1 {
            color: #1a1a1a;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .report-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .report-info p {
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        thead {
            background-color: #007bff;
            color: white;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            font-weight: bold;
        }
        tbody tr:nth-child(odd) {
            background-color: #f9f9f9;
        }
        tbody tr:hover {
            background-color: #f0f0f0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <h1>$reportTitle</h1>

    <div class="report-info">
        <p><strong>Report Generated:</strong> $generatedDate</p>
        <p><strong>Total Users:</strong> {$users->count()}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Birthday</th>
                <th>Guardian Name</th>
                <th>Guardian Phone</th>
                <th>Guardian Email</th>
                <th>Date Registered</th>
            </tr>
        </thead>
        <tbody>
HTML;

        foreach ($users as $user) {
            $age = $user->age ? $user->age : '-';
            $gender = $user->gender ? $user->gender : '-';
            $birthday = $user->birthday ? $user->birthday->format('Y-m-d') : '-';
            $guardianName = $user->guardian_fullname ? $user->guardian_fullname : '-';
            $guardianPhone = $user->guardian_phone ? $user->guardian_phone : '-';
            $guardianEmail = $user->guardian_email ? $user->guardian_email : '-';

            $html .= <<<HTML
            <tr>
                <td>{$user->user_id}</td>
                <td>{$user->name}</td>
                <td>{$user->email}</td>
                <td>{$age}</td>
                <td>{$gender}</td>
                <td>{$birthday}</td>
                <td>{$guardianName}</td>
                <td>{$guardianPhone}</td>
                <td>{$guardianEmail}</td>
                <td>{$user->created_at->format('Y-m-d H:i:s')}</td>
            </tr>
HTML;
        }

        $html .= <<<HTML
        </tbody>
    </table>

    <div class="footer">
        <p>This report was automatically generated by TanganakDusun Admin Panel</p>
    </div>
</body>
</html>
HTML;

        return $html;
    }

    /* Create a title for the report based on its type */
    private function getReportTitle($criteria)
    {
        $reportType = $criteria['report_type'];

        /* Choose the title based on report type */
        if ($reportType === 'overall') {
            $title = 'Overall User Report';
        } elseif ($reportType === 'monthly') {
            $monthName = Carbon::createFromFormat('Y-m', $criteria['month'])->format('F Y');
            $title = "User Report - $monthName";
        } else {
            $startDate = $criteria['start_date'];
            $endDate = $criteria['end_date'];
            $title = "User Report - $startDate to $endDate";
        }

        return $title;
    }

    /* Get list of months that have user registrations */
    public function getAvailableMonths(): JsonResponse
    {
        try {
            /* Get all users */
            $users = User::where('role', 'user')
                ->select('created_at')
                ->get();

            /* Find all unique months */
            $monthsArray = [];
            foreach ($users as $user) {
                $yearMonth = $user->created_at->format('Y-m');
                $monthsArray[$yearMonth] = $user->created_at;
            }

            /* Sort by most recent first */
            krsort($monthsArray);

            /* Format the months nicely for display */
            $months = collect($monthsArray)->map(function ($date, $yearMonth) {
                return [
                    'value' => $yearMonth,
                    'label' => $date->format('F Y'),
                ];
            })->values();

            /* Send back the list of months */
            return response()->json([
                'success' => true,
                'months' => $months,
            ]);
        } catch (\Exception $e) {
            /* If something goes wrong, log it */
            \Log::error('Error fetching available months: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch available months',
            ], 500);
        }
    }
}
