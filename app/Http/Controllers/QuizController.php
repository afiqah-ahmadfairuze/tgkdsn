<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\StreakService;

/*
 * Handles quiz-related operations for students
 * Includes quiz listing, taking quizzes, and leaderboard
 */
class QuizController extends Controller
{
    /* ============================================
       SHOW ALL QUIZZES THAT KIDS CAN TAKE
       ============================================ */
    public function getAvailableQuizzes(): JsonResponse
    {
        /* Get all quizzes that are turned on for students */
        $quizzes = Quiz::where('is_available', true)
            ->with('questions')
            ->select('id', 'title', 'description', 'category', 'total_marks', 'cover_image')
            ->get()
            ->map(function ($quiz) {
                /* Prepare each quiz with full image path */
                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'category' => $quiz->category,
                    'total_marks' => $quiz->total_marks,
                    'cover_image' => $quiz->cover_image ? asset('storage/' . $quiz->cover_image) : null,
                    'questions' => $quiz->questions,
                ];
            });

        /* Send the list of quizzes back to the app */
        return response()->json([
            'quizzes' => $quizzes,
        ]);
    }

    /* ============================================
       SHOW THE LEADERBOARD (TOP STUDENTS)
       ============================================ */
    public function getLeaderboard(): JsonResponse
    {
        $streakService = new StreakService();

        /* Get all students (not admins) with their quiz scores */
        $users = User::where('role', '!=', 'admin')
            ->with('quizAttempts')
            ->get()
            ->map(function ($user) use ($streakService) {
                /* Count up all the marks and quizzes for each student */
                $totalMarks = $streakService->calculateUserTotalMarks($user);
                $totalQuizzes = $user->quizAttempts()->count();

                return [
                    'id' => $user->id,
                    'user_id' => $user->user_id,
                    'name' => $user->name,
                    'profile_picture' => $user->profile_picture ? asset('storage/' . $user->profile_picture) : null,
                    'total_marks' => $totalMarks,
                    'total_quizzes' => $totalQuizzes,
                    'created_at' => $user->created_at,
                ];
            })
            /* Sort students by highest marks, then most quizzes taken */
            ->sortBy(function ($item) {
                return [
                    -$item['total_marks'],
                    -$item['total_quizzes'],
                    $item['created_at']->timestamp,
                ];
            })
            ->values()
            ->map(function ($item, $index) {
                /* Give each student their rank number (1st, 2nd, 3rd, etc) */
                $item['rank'] = $index + 1;
                return $item;
            });

        /* Send the leaderboard back to the app */
        return response()->json([
            'leaderboard' => $users,
        ]);
    }

    /* ============================================
       GET QUESTIONS FOR A SPECIFIC QUIZ
       ============================================ */
    public function getQuizQuestions($id): JsonResponse
    {
        /* Find the quiz the student wants to take */
        $quiz = Quiz::with('questions')->findOrFail($id);

        /* Make sure the quiz is turned on before showing it */
        if (!$quiz->is_available) {
            return response()->json([
                'error' => 'This quiz is not available',
            ], 403);
        }

        /* Prepare all the questions with their answer choices */
        $questions = $quiz->questions->map(function ($question) {
            return [
                'id' => $question->id,
                'question_bm' => $question->question_bm,
                'question_eng' => $question->question_eng,
                'options' => [
                    $question->option_a,
                    $question->option_b,
                    $question->option_c,
                    $question->option_d,
                ],
                'correctAnswer' => $question->correct_answer,
                'marks' => $question->marks,
                'image' => $question->question_image ? asset('storage/' . $question->question_image) : null,
            ];
        });

        /* Send the quiz and its questions back to the app */
        return response()->json([
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'total_marks' => $quiz->total_marks,
            ],
            'questions' => $questions,
        ]);
    }

    /* ============================================
       CHECK STUDENT'S ANSWERS AND SAVE SCORE
       ============================================ */
    public function submitQuizAnswers(Request $request, $id): JsonResponse
    {
        /* Make sure the student sent us proper answers */
        $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|integer',
            'answers.*.answer' => 'required|string',
        ]);

        /* Get the quiz and the student who's taking it */
        $quiz = Quiz::findOrFail($id);
        $user = $request->user();
        $streakService = new StreakService();

        $answers = $request->answers;
        $marksObtained = 0;

        /* Go through each answer and check if it's correct */
        foreach ($answers as $answer) {
            $question = $quiz->questions()->findOrFail($answer['question_id']);

            /* If the answer matches (A, B, C, or D), add the marks */
            if (strtoupper($answer['answer']) === strtoupper($question->correct_answer)) {
                $marksObtained += $question->marks;
            }
        }

        /* Save this quiz attempt in the database */
        $attempt = QuizAttempt::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'marks_obtained' => $marksObtained,
            'attempted_at' => now(),
        ]);

        /* Update the student's daily streak (how many days in a row they've done quizzes) */
        $streakService->updateStreakAfterQuizAttempt($user);

        /* Calculate what percentage they got (like 75% or 90%) */
        $percentage = $quiz->total_marks > 0 ? round(($marksObtained / $quiz->total_marks) * 100, 2) : 0;

        /* Tell the student their score */
        return response()->json([
            'success' => true,
            'message' => 'Quiz submitted successfully',
            'marks_obtained' => $marksObtained,
            'total_marks' => $quiz->total_marks,
            'percentage' => $percentage,
            'attempt_id' => $attempt->id,
        ]);
    }

    /* ============================================
       SHOW RESULTS FROM A QUIZ THE STUDENT TOOK
       ============================================ */
    public function getAttemptResults($id): JsonResponse
    {
        /* Find the quiz attempt record */
        $attempt = QuizAttempt::with('quiz')->find($id);

        /* If there's no record, tell the student we couldn't find it */
        if (!$attempt) {
            return response()->json([
                'error' => 'Attempt not found',
            ], 404);
        }

        /* Make sure this student is looking at their own quiz (not someone else's) */
        if ($attempt->user_id !== auth()->id()) {
            return response()->json([
                'error' => 'Unauthorized',
            ], 403);
        }

        /* Calculate their percentage score */
        $percentage = round(($attempt->marks_obtained / $attempt->quiz->total_marks) * 100, 2);

        /* Show the student their quiz results */
        return response()->json([
            'quiz_title' => $attempt->quiz->title,
            'marks_obtained' => $attempt->marks_obtained,
            'total_marks' => $attempt->quiz->total_marks,
            'percentage' => $percentage,
            'passed' => $percentage >= 60,
            'attempted_at' => $attempt->attempted_at,
        ]);
    }
}
