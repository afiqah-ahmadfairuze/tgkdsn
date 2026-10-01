<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    /* Show the admin all the quizzes in the system */
    public function index(Request $request): Response
    {
        /* Check if the admin is searching or filtering quizzes */
        $search = $request->input('search', '');
        $categoryFilter = $request->input('category', '');

        /* Get all quizzes and apply search/filters if needed */
        $quizzes = Quiz::when($search, function ($query, $search) {
            return $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        })
            ->when($categoryFilter, function ($query, $categoryFilter) {
                return $query->where('category', $categoryFilter);
            })
            ->with('questions')
            ->withCount('quizAttempts')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($quiz) {
                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'category' => $quiz->category,
                    'cover_image' => $quiz->cover_image ? asset('storage/' . $quiz->cover_image) : null,
                    'questions_count' => $quiz->questions->count(),
                    'total_marks' => $quiz->total_marks,
                    'total_attempts' => $quiz->quiz_attempts_count,
                    'questions' => $quiz->questions->map(function ($q) {
                        return [
                            'id' => $q->id,
                            'question_bm' => $q->question_bm,
                            'question_eng' => $q->question_eng,
                            'option_a' => $q->option_a,
                            'option_b' => $q->option_b,
                            'option_c' => $q->option_c,
                            'option_d' => $q->option_d,
                            'correct_answer' => $q->correct_answer,
                            'marks' => $q->marks,
                            'question_image' => $q->question_image ? asset('storage/' . $q->question_image) : null,
                        ];
                    })->toArray(),
                ];
            });

        /* Get the list of categories for the filter dropdown */
        $categories = Category::orderBy('name')->get();

        /* Show the admin the quiz management page */
        return Inertia::render('Admin/Quiz', [
            'quizzes' => $quizzes,
            'search' => $search,
            'categories' => $categories,
        ]);
    }

    /* Create a new quiz (step 1: basic info and cover image) */
    public function store(Request $request)
    {
        /* Get the list of valid categories from the database */
        $validCategories = Category::pluck('name')->toArray();
        $categoryRule = !empty($validCategories) ? ['nullable', 'string', 'in:' . implode(',', $validCategories)] : ['nullable', 'string'];

        /* Make sure the quiz info is valid */
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => $categoryRule,
            'cover_image' => ['nullable', 'image', 'max:2048'],
        ]);

        $coverImage = null;

        /* Save the cover image if they uploaded one */
        if ($request->hasFile('cover_image')) {
            $coverImage = $request->file('cover_image')->store('quiz_covers', 'public');
        }

        /* Create the new quiz in the database */
        $quiz = Quiz::create([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'category' => $request->input('category'),
            'cover_image' => $coverImage,
            'total_marks' => 0,
        ]);

        /* Tell the admin the quiz was created */
        return response()->json([
            'success' => true,
            'message' => 'Quiz created! Now add questions to it.',
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'category' => $quiz->category,
                'cover_image' => $coverImage ? asset('storage/' . $coverImage) : null,
                'questions_count' => 0,
                'total_marks' => 0,
                'questions' => [],
            ],
        ]);
    }

    /* Update a quiz's basic info (title, description, category, cover image) */
    public function updateDetails(Request $request, int $id)
    {
        /* Find the quiz */
        $quiz = Quiz::findOrFail($id);

        /* Get the list of valid categories */
        $validCategories = Category::pluck('name')->toArray();
        $categoryRule = !empty($validCategories) ? ['nullable', 'string', 'in:' . implode(',', $validCategories)] : ['nullable', 'string'];

        /* Make sure the new info is valid */
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => $categoryRule,
            'cover_image' => ['nullable', 'image', 'max:2048'],
        ]);

        /* Handle the cover image */
        $coverImage = $quiz->cover_image;
        if ($request->hasFile('cover_image')) {
            /* Delete the old cover image if it exists */
            if ($coverImage && Storage::disk('public')->exists($coverImage)) {
                Storage::disk('public')->delete($coverImage);
            }
            $coverImage = $request->file('cover_image')->store('quiz_covers', 'public');
        }

        /* Save the changes */
        $quiz->update([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'category' => $request->input('category'),
            'cover_image' => $coverImage,
        ]);

        /* Tell the admin it was updated */
        return response()->json([
            'success' => true,
            'message' => 'Quiz details updated successfully!',
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'category' => $quiz->category,
                'cover_image' => $quiz->cover_image ? asset('storage/' . $quiz->cover_image) : null,
                'questions_count' => $quiz->questions->count(),
                'total_marks' => $quiz->total_marks,
            ],
        ]);
    }

    /* Add or update questions for a quiz (step 2) */
    public function update(Request $request, int $id)
    {
        /* Find the quiz */
        $quiz = Quiz::findOrFail($id);

        /* Get the questions data sent from the form */
        $questionsJson = $request->input('questions_json');

        /* Turn the JSON text into an array we can work with */
        $questions = json_decode($questionsJson, true);

        /* Make sure we got valid questions data */
        if (!is_array($questions) || empty($questions)) {
            \Log::error('Invalid questions format', [
                'questions_json' => $questionsJson,
                'decoded_questions' => $questions,
            ]);
            return response()->json(['success' => false, 'message' => 'Questions data is required'], 422);
        }

        /* Make sure they provided between 1 and 20 questions */
        if (count($questions) < 1 || count($questions) > 20) {
            return response()->json(['success' => false, 'message' => 'You must provide between 1 and 20 questions'], 422);
        }

        /* Check each question to make sure all fields are filled in correctly */
        $errors = [];
        foreach ($questions as $index => $q) {
            if (empty($q['question_bm'])) {
                $errors[] = "Question " . ($index + 1) . ": Question (BM) is required";
            }
            if (empty($q['question_eng'])) {
                $errors[] = "Question " . ($index + 1) . ": Question (ENG) is required";
            }
            if (empty($q['option_a'])) {
                $errors[] = "Question " . ($index + 1) . ": Option A is required";
            }
            if (empty($q['option_b'])) {
                $errors[] = "Question " . ($index + 1) . ": Option B is required";
            }
            if (empty($q['option_c'])) {
                $errors[] = "Question " . ($index + 1) . ": Option C is required";
            }
            if (empty($q['option_d'])) {
                $errors[] = "Question " . ($index + 1) . ": Option D is required";
            }
            if (empty($q['correct_answer']) || !in_array($q['correct_answer'], ['A', 'B', 'C', 'D'])) {
                $errors[] = "Question " . ($index + 1) . ": Correct answer must be A, B, C, or D";
            }
            if (empty($q['marks']) || !is_numeric($q['marks']) || (int)$q['marks'] < 1) {
                $errors[] = "Question " . ($index + 1) . ": Marks must be a positive number";
            }
        }

        /* If there were any errors, tell the admin what's wrong */
        if (!empty($errors)) {
            return response()->json(['success' => false, 'message' => implode('; ', $errors)], 422);
        }

        /* Check that any uploaded images are valid */
        $request->validate([
            'question_images.*' => ['nullable', 'image', 'max:2048'],
        ]);

        /* Add up how many marks this quiz is worth in total */
        $totalMarks = array_sum(array_column($questions, 'marks'));

        /* Save the total marks to the quiz */
        $quiz->update(['total_marks' => $totalMarks]);

        /* First, collect which existing images will be preserved */
        $preservedImages = [];
        $newQuestionsData = [];

        foreach ($questions as $index => $questionData) {
            $questionImage = null;

            /* Check if they uploaded a new image */
            if ($request->hasFile("question_images.{$index}")) {
                $file = $request->file("question_images.{$index}");
                $questionImage = $file->store('quiz_questions', 'public');
            } elseif (!empty($questionData['existing_image'])) {
                /* Keep the existing image - extract the path */
                $existingImage = $questionData['existing_image'];
                if (filter_var($existingImage, FILTER_VALIDATE_URL)) {
                    /* It's a full URL, so extract just the path */
                    $parsedPath = parse_url($existingImage, PHP_URL_PATH);
                    $questionImage = preg_replace('#^/storage/#', '', $parsedPath);
                } else {
                    /* It's already just a path */
                    $questionImage = $existingImage;
                }
                /* Mark this image as preserved so we don't delete it */
                if ($questionImage) {
                    $preservedImages[] = $questionImage;
                }
            }

            $newQuestionsData[] = [
                'quiz_id' => $quiz->id,
                'question_bm' => $questionData['question_bm'],
                'question_eng' => $questionData['question_eng'],
                'option_a' => $questionData['option_a'],
                'option_b' => $questionData['option_b'],
                'option_c' => $questionData['option_c'],
                'option_d' => $questionData['option_d'],
                'correct_answer' => $questionData['correct_answer'],
                'marks' => (int)$questionData['marks'],
                'question_image' => $questionImage,
            ];
        }

        /* Now delete old questions and only delete images that are NOT being preserved */
        foreach ($quiz->questions as $oldQuestion) {
            if ($oldQuestion->question_image && !in_array($oldQuestion->question_image, $preservedImages) && Storage::disk('public')->exists($oldQuestion->question_image)) {
                Storage::disk('public')->delete($oldQuestion->question_image);
            }
        }
        $quiz->questions()->delete();

        /* Save all the new questions to the database */
        foreach ($newQuestionsData as $questionData) {
            QuizQuestion::create($questionData);
        }

        /* Tell the admin the questions were saved */
        return response()->json(['success' => true, 'message' => 'Questions added successfully!']);
    }

    /* Delete a quiz and all its questions */
    public function destroy(int $id)
    {
        /* Find the quiz */
        $quiz = Quiz::findOrFail($id);

        /* Delete all the question images */
        foreach ($quiz->questions as $question) {
            if ($question->question_image) {
                $imagePath = storage_path('app/public/quiz_questions/' . $question->question_image);
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }
        }

        /* Delete the quiz and all its questions */
        $quiz->delete();

        return response()->json(['success' => true, 'message' => 'Quiz deleted successfully.']);
    }

    /* Get statistics about quizzes for the admin */
    public function getStats()
    {
        try {
            /* Get all quizzes and their questions */
            $quizzes = Quiz::with('questions')->get();
            $totalQuizzes = $quizzes->count();
            $totalQuestions = $quizzes->sum(fn($q) => $q->questions->count());

            /* Get all quiz attempts by students */
            $quizAttempts = \App\Models\QuizAttempt::all();
            $totalAttempts = $quizAttempts->count();
            $avgScore = $quizAttempts->count() > 0
                ? round($quizAttempts->avg('marks_obtained'), 2)
                : 0;

            /* Send back the stats */
            return response()->json([
                'success' => true,
                'data' => [
                    'total_quizzes' => $totalQuizzes,
                    'total_questions' => $totalQuestions,
                    'total_attempts' => $totalAttempts,
                    'average_attempt_score' => $avgScore,
                ]
            ]);
        } catch (\Exception $e) {
            /* If something goes wrong, write it to the log */
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch quiz statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}
