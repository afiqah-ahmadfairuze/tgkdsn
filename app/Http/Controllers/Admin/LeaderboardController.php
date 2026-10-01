<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Models\BonusPoints;
use App\Models\LeaderboardHistory;
use App\Services\StreakService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Carbon;

class LeaderboardController extends Controller
{
    /* Show the admin the leaderboard with student rankings */
    public function index(Request $request): Response
    {
        /* Check if the admin is searching or filtering */
        $search = $request->input('search', '');
        $filter = $request->input('filter', 'overall');
        $streakService = new StreakService();

        /* Get all students and calculate their scores */
        $leaderboard = User::where('role', '!=', 'admin')
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('user_id', 'like', "%{$search}%");
                });
            })
            ->with('quizAttempts')
            ->get()
            ->map(function ($user) use ($filter, $streakService) {
                /* Get their quiz attempts */
                $attempts = $user->quizAttempts;

                /* Filter by time period if needed */
                if ($filter === 'weekly') {
                    $attempts = $attempts->filter(function ($attempt) {
                        return $attempt->attempted_at >= Carbon::now()->subWeek();
                    });
                } elseif ($filter === 'monthly') {
                    $attempts = $attempts->filter(function ($attempt) {
                        return $attempt->attempted_at >= Carbon::now()->subMonth();
                    });
                }

                /* Add up their marks (quiz marks + bonus points) */
                $totalMarks = $attempts->sum('marks_obtained');
                $bonusPoints = $user->bonusPointsReceived()->sum('points');
                $totalMarks += $bonusPoints;
                $totalQuizzes = $attempts->count();

                return [
                    'id' => $user->id,
                    'user_id' => $user->user_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'age' => $user->age,
                    'gender' => $user->gender,
                    'total_marks' => $totalMarks,
                    'total_quizzes' => $totalQuizzes,
                ];
            })
            ->sortBy(function ($item) {
                /* Sort by marks first, then by quiz count */
                return [-$item['total_marks'], -$item['total_quizzes']];
            })
            ->values()
            ->map(function ($item, $index) {
                /* Give each student their rank number */
                $item['rank'] = $index + 1;
                return $item;
            });

        /* Get the streak tracker data */
        $streakData = $streakService->getAllStreakData();

        /* Show the admin the leaderboard page */
        return Inertia::render('Admin/Leaderboard', [
            'leaderboard' => $leaderboard,
            'search' => $search,
            'filter' => $filter,
            'streakTracker' => $streakData,
        ]);
    }

    /* Refresh the leaderboard to update the rankings */
    public function refresh(Request $request)
    {
        /* Tell the frontend to recalculate the rankings */
        return response()->json(['success' => true, 'message' => 'Leaderboard refreshed successfully!']);
    }

    /* Give bonus points to a student */
    public function awardBonusPoints(Request $request): JsonResponse
    {
        /* Make sure the info is valid */
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'points' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:255',
        ]);

        /* Find the student */
        $user = User::findOrFail($request->user_id);
        $admin = $request->user();

        /* Save the bonus points */
        BonusPoints::create([
            'user_id' => $user->id,
            'admin_id' => $admin->id,
            'points' => $request->points,
            'reason' => $request->reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Bonus points awarded to {$user->name}",
        ]);
    }

    /* Get all the streak data for students */
    public function getStreakTracker(): JsonResponse
    {
        /* Get streak data from the service */
        $streakService = new StreakService();
        $streakData = $streakService->getAllStreakData();

        return response()->json([
            'streaks' => $streakData,
        ]);
    }

    /* Save the current leaderboard rankings to history and reset everything */
    public function recordLeaderboardHistory(Request $request): JsonResponse
    {
        $streakService = new StreakService();

        /* Get the current leaderboard rankings */
        $leaderboard = User::where('role', '!=', 'admin')
            ->with('quizAttempts', 'streak')
            ->get()
            ->map(function ($user) use ($streakService) {
                return [
                    'user' => $user,
                    'total_marks' => $streakService->calculateUserTotalMarks($user),
                    'total_quizzes' => $user->quizAttempts->count(),
                ];
            })
            ->sortBy(function ($item) {
                return [-$item['total_marks'], -$item['total_quizzes']];
            })
            ->values();

        /* Save each student's ranking to history */
        $now = now();
        foreach ($leaderboard as $index => $userData) {
            LeaderboardHistory::create([
                'user_id' => $userData['user']->id,
                'rank' => $index + 1,
                'total_marks' => $userData['total_marks'],
                'total_quizzes' => $userData['total_quizzes'],
                'streak_count' => $userData['user']->streak?->current_streak ?? 0,
                'reset_date' => $now,
            ]);
        }

        /* Reset everyone's streaks back to zero */
        $streakService->resetAllStreaks();

        return response()->json([
            'success' => true,
            'message' => 'Leaderboard history recorded and streaks reset',
        ]);
    }

    /* Get leaderboard data filtered by time period (as JSON) */
    public function getFilteredLeaderboard(Request $request): JsonResponse
    {
        /* Check what time period the admin wants */
        $filter = $request->input('filter', 'overall');
        $streakService = new StreakService();

        /* Get all students and calculate their filtered scores */
        $leaderboard = User::where('role', '!=', 'admin')
            ->with('quizAttempts', 'bonusPointsReceived')
            ->get()
            ->map(function ($user) use ($filter) {
                $attempts = $user->quizAttempts;

                /* Filter by time period */
                if ($filter === 'weekly') {
                    $attempts = $attempts->filter(function ($attempt) {
                        return $attempt->attempted_at >= Carbon::now()->subWeek();
                    });
                } elseif ($filter === 'monthly') {
                    $attempts = $attempts->filter(function ($attempt) {
                        return $attempt->attempted_at >= Carbon::now()->subMonth();
                    });
                }

                /* Calculate their total marks */
                $totalMarks = $attempts->sum('marks_obtained') + $user->bonusPointsReceived->sum('points');
                $totalQuizzes = $attempts->count();

                return [
                    'id' => $user->id,
                    'user_id' => $user->user_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'age' => $user->age,
                    'gender' => $user->gender,
                    'total_marks' => $totalMarks,
                    'total_quizzes' => $totalQuizzes,
                ];
            })
            ->sortBy(function ($item) {
                return [-$item['total_marks'], -$item['total_quizzes']];
            })
            ->values()
            ->map(function ($item, $index) {
                $item['rank'] = $index + 1;
                return $item;
            });

        /* Send back the filtered leaderboard */
        return response()->json([
            'leaderboard' => $leaderboard,
            'filter' => $filter,
        ]);
    }

    /* Get the history of all bonus points given to students */
    public function getBonusHistory(): JsonResponse
    {
        /* Get all bonus points records */
        $bonusHistory = BonusPoints::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($bonus) {
                return [
                    'id' => $bonus->id,
                    'name' => $bonus->user->name,
                    'user_id' => $bonus->user->user_id,
                    'bonus_points' => $bonus->points,
                    'reason' => $bonus->reason,
                    'created_at' => $bonus->created_at->format('Y-m-d H:i'),
                ];
            });

        /* Send back the history */
        return response()->json([
            'success' => true,
            'data' => $bonusHistory,
        ]);
    }
}
