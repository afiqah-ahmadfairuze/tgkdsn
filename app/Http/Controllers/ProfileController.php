<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use App\Models\User;
use App\Models\QuizAttempt;
use App\Models\UserStreak;
use App\Models\LeaderboardHistory;
use App\Models\UserMaterialProgress;
use App\Models\Feedback;
use App\Services\StreakService;

/*
 * Manages user profile display and settings updates
 * Includes profile data, stats, and activity history
 */
class ProfileController extends Controller
{
    /* Show the student's profile page with all their info and stats */
    public function show(Request $request)
    {
        $user = $request->user();
        $streakService = new StreakService();

        /* Get all the student's basic info */
        $profileData = [
            'id' => $user->id,
            'user_id' => $user->user_id,
            'name' => $user->name,
            'email' => $user->email,
            'birthday' => $user->birthday,
            'age' => $user->age,
            'gender' => $user->gender,
            'guardian_fullname' => $user->guardian_fullname,
            'guardian_phone' => $user->guardian_phone,
            'guardian_email' => $user->guardian_email,
            'profile_picture' => $user->profile_picture,
        ];

        /* Add up all the marks they've earned */
        $totalMarks = $streakService->calculateUserTotalMarks($user);

        /* Count how many quizzes they've done */
        $totalQuizzes = $user->quizAttempts()->count();

        /* Figure out where they rank compared to other students */
        $allUsers = User::where('role', '!=', 'admin')
            ->with('quizAttempts')
            ->get()
            ->map(function ($u) use ($streakService) {
                return [
                    'id' => $u->id,
                    'total_marks' => $streakService->calculateUserTotalMarks($u),
                    'total_quizzes' => $u->quizAttempts()->count(),
                    'created_at' => $u->created_at,
                ];
            })
            /* Sort everyone by marks and quiz count */
            ->sortBy(function ($item) {
                return [
                    -$item['total_marks'],
                    -$item['total_quizzes'],
                    $item['created_at']->timestamp,
                ];
            })
            ->values();

        /* Find this student's rank number */
        $leaderboardRank = 1;
        foreach ($allUsers as $index => $u) {
            if ($u['id'] === $user->id) {
                $leaderboardRank = $index + 1;
                break;
            }
        }

        /* Get their daily quiz streak info */
        $userStreak = UserStreak::where('user_id', $user->id)->first();
        $currentStreak = $userStreak?->current_streak ?? 0;
        $lastQuizDate = $userStreak?->last_quiz_date ?? null;

        /* Put together all their stats */
        $stats = [
            'leaderboard_rank' => $leaderboardRank,
            'total_quizzes' => $totalQuizzes,
            'total_marks' => $totalMarks,
            'streak' => [
                'current_streak' => $currentStreak,
                'last_quiz_date' => $lastQuizDate,
            ]
        ];

        /* Get their past leaderboard positions */
        $leaderboardHistory = LeaderboardHistory::where('user_id', $user->id)
            ->orderBy('reset_date', 'desc')
            ->get()
            ->toArray();

        /* Get all the quizzes they've taken */
        $quizAttempts = QuizAttempt::where('user_id', $user->id)
            ->with('quiz')
            ->orderBy('attempted_at', 'desc')
            ->get()
            ->map(function ($attempt) {
                return [
                    'type' => 'quiz_attempt',
                    'quiz_title' => $attempt->quiz->title ?? 'Unknown Quiz',
                    'quiz_category' => $attempt->quiz->category ?? null,
                    'marks_obtained' => $attempt->marks_obtained,
                    'timestamp' => $attempt->attempted_at,
                ];
            });

        /* Get all the learning materials they've completed */
        $learnedMaterials = UserMaterialProgress::where('user_id', $user->id)
            ->where('completed', true)
            ->with('material')
            ->orderBy('completed_at', 'desc')
            ->get()
            ->map(function ($progress) {
                return [
                    'type' => 'learned_material',
                    'material_title' => $progress->material->title ?? 'Unknown Material',
                    'timestamp' => $progress->completed_at,
                ];
            });

        /* Get all the feedback they've submitted */
        $feedbackSubmissions = Feedback::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($feedback) {
                return [
                    'type' => 'feedback_submission',
                    'feedback_language' => $feedback->language ?? 'en',
                    'timestamp' => $feedback->created_at,
                ];
            });

        /* Combine all their activities and sort by most recent first */
        $activityHistory = collect($quizAttempts)
            ->concat($learnedMaterials)
            ->concat($feedbackSubmissions)
            ->sortByDesc('timestamp')
            ->values()
            ->toArray();

        /* Show them their profile page */
        return Inertia::render('UserProfile', [
            'user' => $profileData,
            'stats' => $stats,
            'leaderboard_history' => $leaderboardHistory,
            'activity_history' => $activityHistory,
        ]);
    }

    /* Show the page where they can edit their profile */
    public function edit(Request $request)
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail && !$request->user()->hasVerifiedEmail(),
            'status' => session('status'),
        ]);
    }

    /* Save changes to their profile */
    public function update(Request $request)
    {
        /* Make sure the info they entered is valid */
        $request->validate([
            'name' => 'required|string|max:255',
            'birthday' => 'nullable|date',
            'age' => 'nullable|integer|min:7|max:12',
            'gender' => 'nullable|string|in:male,female,other',
        ]);

        /* Update their profile in the database */
        $user = $request->user();
        $user->update($request->only(['name', 'birthday', 'age', 'gender']));

        return redirect()->back()->with('status', 'Profile updated successfully.');
    }

    /* Delete their account permanently */
    public function destroy(Request $request)
    {
        /* Make sure they typed their password correctly */
        $request->validate([
            'password' => 'required|current-password',
        ]);

        $user = $request->user();

        /* Log them out */
        auth()->logout();

        /* Delete their account */
        $user->delete();

        return redirect('/')->with('status', 'Account deleted successfully.');
    }

    /* Change their profile picture */
    public function updateProfilePicture(Request $request)
    {
        /* Make sure they uploaded a valid image */
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('profile_picture')) {
            /* Delete their old picture if they had one */
            if ($user->profile_picture) {
                \Storage::delete('public/' . $user->profile_picture);
            }

            /* Save the new picture */
            $path = $request->file('profile_picture')->store('profile-pictures', 'public');
            $user->update(['profile_picture' => $path]);
        }

        return redirect()->back()->with('status', 'Profile picture updated successfully.');
    }

    /* Change their email address */
    public function updateEmail(Request $request)
    {
        /* Make sure the new email is valid and not already used */
        $request->validate([
            'email' => 'required|email|unique:users,email,' . $request->user()->id,
            'password' => 'required|current-password',
        ]);

        /* Update their email */
        $request->user()->update([
            'email' => $request->email,
        ]);

        return redirect()->back()->with('status', 'Email updated successfully.');
    }

    /* Change their password */
    public function updatePassword(Request $request)
    {
        /* Make sure they know their old password and the new one is strong */
        $request->validate([
            'current_password' => 'required|current-password',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        /* Save the new password */
        $request->user()->update([
            'password' => bcrypt($request->password),
        ]);

        return redirect()->back()->with('status', 'Password updated successfully.');
    }

    /* Update their guardian's contact info */
    public function updateGuardianInfo(Request $request)
    {
        /* Make sure the guardian info looks right */
        $request->validate([
            'guardian_fullname' => 'nullable|string|max:255',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_email' => 'nullable|email|max:255',
        ]);

        /* Save the guardian info */
        $request->user()->update($request->only([
            'guardian_fullname',
            'guardian_phone',
            'guardian_email',
        ]));

        return redirect()->back()->with('status', 'Guardian information updated successfully.');
    }

    /* Send back their profile data as JSON */
    public function getProfileData(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'user_id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'birthday' => $user->birthday,
                'age' => $user->age,
                'gender' => $user->gender,
                'guardian_fullname' => $user->guardian_fullname,
                'guardian_phone' => $user->guardian_phone,
                'guardian_email' => $user->guardian_email,
                'profile_picture' => $user->profile_picture,
            ],
        ]);
    }

    /* Change their email (different method for some reason) */
    public function requestEmailChange(Request $request)
    {
        /* Make sure the new email is valid */
        $request->validate([
            'new_email' => 'required|email|unique:users,email,' . $request->user()->id,
            'password' => 'required|current-password',
        ]);

        /* Update their email */
        $request->user()->update([
            'email' => $request->new_email,
        ]);

        return redirect()->back()->with('status', 'Email changed successfully.');
    }
}
