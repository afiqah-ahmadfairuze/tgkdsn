<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

// Protected routes - require authentication and email verification
Route::get('/vr-museum', function () {
    return Inertia::render('VRMuseum');
})->middleware(['auth', 'verified'])->name('vr-museum');

Route::get('/quiz', function () {
    return Inertia::render('Quiz');
})->middleware(['auth', 'verified'])->name('quiz');

Route::get('/quiz/{id}', function ($id) {
    return Inertia::render('QuizDetail', ['quizId' => $id]);
})->middleware(['auth', 'verified'])->name('quiz.detail');

Route::get('/quiz-results/{attemptId}', function ($attemptId) {
    return Inertia::render('QuizResults', ['attemptId' => $attemptId]);
})->middleware(['auth', 'verified'])->name('quiz.results');

Route::get('/learning-materials', function () {
    return Inertia::render('DusLearn');
})->middleware(['auth', 'verified'])->name('learning-materials');

Route::get('/learning-materials/{materialId}', function ($materialId) {
    return Inertia::render('DusLearnFlashcard', ['materialId' => $materialId]);
})->middleware(['auth', 'verified'])->name('learning-materials.detail');

Route::get('/dictionary', function () {
    return Inertia::render('Dictionary');
})->middleware(['auth', 'verified'])->name('dictionary');

Route::get('/user-profile', [ProfileController::class, 'show'])->middleware(['auth', 'verified'])->name('user-profile');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/picture', [ProfileController::class, 'updateProfilePicture'])->name('profile.picture.update');
    Route::patch('/profile/email', [ProfileController::class, 'updateEmail'])->name('profile.email.update');
    Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
    Route::patch('/profile/guardian', [ProfileController::class, 'updateGuardianInfo'])->name('profile.guardian.update');
    Route::get('/api/profile/data', [ProfileController::class, 'getProfileData'])->name('profile.data');
    Route::post('/api/profile/request-email-change', [ProfileController::class, 'requestEmailChange'])->name('profile.request-email-change');

    // Quiz API Routes
    Route::get('/api/quiz/available', [\App\Http\Controllers\QuizController::class, 'getAvailableQuizzes'])->name('quiz.available');
    Route::get('/api/quiz/leaderboard', [\App\Http\Controllers\QuizController::class, 'getLeaderboard'])->name('quiz.leaderboard');
    Route::get('/api/quiz/{id}/questions', [\App\Http\Controllers\QuizController::class, 'getQuizQuestions'])->name('quiz.questions');
    Route::post('/api/quiz/{id}/submit', [\App\Http\Controllers\QuizController::class, 'submitQuizAnswers'])->name('quiz.submit');
    Route::get('/api/quiz/attempt/{id}', [\App\Http\Controllers\QuizController::class, 'getAttemptResults'])->name('quiz.attempt.results');

    // Dictionary API Routes
    Route::get('/api/dictionary/search', [\App\Http\Controllers\DictionaryController::class, 'search'])->name('dictionary.search');
    Route::get('/api/dictionary/combinations', [\App\Http\Controllers\DictionaryController::class, 'getLanguageCombinations'])->name('dictionary.combinations');

    // Feedback Routes
    Route::post('/api/feedback', [\App\Http\Controllers\FeedbackController::class, 'store'])->name('feedback.store');

    // Learning Materials API Routes
    Route::get('/api/learning-materials', [\App\Http\Controllers\Admin\LearningMaterialController::class, 'getPublicMaterials'])->name('learning-materials.public');
    Route::post('/api/learning-materials/{materialId}/complete', [\App\Http\Controllers\Admin\LearningMaterialController::class, 'markAsCompleted'])->name('learning-materials.complete');
});

// Admin Routes - Protected by authentication and admin role middleware
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('admin.dashboard');
    });

    Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

    // User management (view and delete only - users manage their own accounts)
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
    Route::delete('/users', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('users.destroy');
    Route::get('/api/users/analytics', [\App\Http\Controllers\Admin\UserController::class, 'analytics'])->name('users.analytics');

    // Quiz management
    Route::get('/quiz', [\App\Http\Controllers\Admin\QuizController::class, 'index'])->name('quiz.index');
    Route::post('/quiz', [\App\Http\Controllers\Admin\QuizController::class, 'store'])->name('quiz.store');
    Route::post('/quiz/{id}/details', [\App\Http\Controllers\Admin\QuizController::class, 'updateDetails'])->name('quiz.details.update');
    Route::put('/quiz/{id}', [\App\Http\Controllers\Admin\QuizController::class, 'update'])->name('quiz.update');
    Route::delete('/quiz/{id}', [\App\Http\Controllers\Admin\QuizController::class, 'destroy'])->name('quiz.destroy');
    Route::get('/api/quiz/stats', [\App\Http\Controllers\Admin\QuizController::class, 'getStats'])->name('quiz.stats');

    // Category management
    Route::get('/api/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('categories.index');
    Route::post('/api/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('categories.store');
    Route::delete('/api/categories/{id}', [\App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/learning-materials', [\App\Http\Controllers\Admin\LearningMaterialController::class, 'index'])->name('learning-materials.index');
    Route::get('/api/learning-materials/report', [\App\Http\Controllers\Admin\LearningMaterialController::class, 'getReportData'])->name('learning-materials.report');
    Route::post('/learning-materials/categories', [\App\Http\Controllers\Admin\LearningMaterialController::class, 'storeCategory'])->name('learning-materials.categories.store');
    Route::put('/learning-materials/categories/{category}', [\App\Http\Controllers\Admin\LearningMaterialController::class, 'updateCategory'])->name('learning-materials.categories.update');
    Route::delete('/learning-materials/categories/{category}', [\App\Http\Controllers\Admin\LearningMaterialController::class, 'destroyCategory'])->name('learning-materials.categories.destroy');
    Route::post('/learning-materials', [\App\Http\Controllers\Admin\LearningMaterialController::class, 'storeMaterial'])->name('learning-materials.store');
    Route::post('/learning-materials/{material}/details', [\App\Http\Controllers\Admin\LearningMaterialController::class, 'updateMaterialDetails'])->name('learning-materials.details.update');
    Route::put('/learning-materials/{material}', [\App\Http\Controllers\Admin\LearningMaterialController::class, 'updateMaterial'])->name('learning-materials.update');
    Route::delete('/learning-materials/{material}', [\App\Http\Controllers\Admin\LearningMaterialController::class, 'destroyMaterial'])->name('learning-materials.destroy');

    // Leaderboard management
    Route::get('/leaderboard', [\App\Http\Controllers\Admin\LeaderboardController::class, 'index'])->name('leaderboard.index');
    Route::post('/leaderboard/refresh', [\App\Http\Controllers\Admin\LeaderboardController::class, 'refresh'])->name('leaderboard.refresh');
    Route::post('/api/leaderboard/bonus-points', [\App\Http\Controllers\Admin\LeaderboardController::class, 'awardBonusPoints'])->name('leaderboard.bonus-points');
    Route::get('/api/leaderboard/streak-tracker', [\App\Http\Controllers\Admin\LeaderboardController::class, 'getStreakTracker'])->name('leaderboard.streak-tracker');
    Route::post('/api/leaderboard/record-history', [\App\Http\Controllers\Admin\LeaderboardController::class, 'recordLeaderboardHistory'])->name('leaderboard.record-history');
    Route::get('/api/leaderboard/filtered', [\App\Http\Controllers\Admin\LeaderboardController::class, 'getFilteredLeaderboard'])->name('leaderboard.filtered');
    Route::get('/api/leaderboard/bonus-history', [\App\Http\Controllers\Admin\LeaderboardController::class, 'getBonusHistory'])->name('leaderboard.bonus-history');

    // Dictionary management
    Route::get('/dictionary', [\App\Http\Controllers\Admin\DictionaryController::class, 'index'])->name('dictionary.index');
    Route::post('/dictionary', [\App\Http\Controllers\Admin\DictionaryController::class, 'store'])->name('dictionary.store');
    Route::put('/dictionary/{entry_id}', [\App\Http\Controllers\Admin\DictionaryController::class, 'update'])->name('dictionary.update');
    Route::delete('/dictionary', [\App\Http\Controllers\Admin\DictionaryController::class, 'destroy'])->name('dictionary.destroy');
    Route::post('/api/dictionary/categories', [\App\Http\Controllers\Admin\DictionaryController::class, 'storeCategory'])->name('dictionary.categories.store');
    Route::put('/api/dictionary/categories/{id}', [\App\Http\Controllers\Admin\DictionaryController::class, 'updateCategory'])->name('dictionary.categories.update');
    Route::delete('/api/dictionary/categories/{id}', [\App\Http\Controllers\Admin\DictionaryController::class, 'destroyCategory'])->name('dictionary.categories.destroy');

    // Dashboard API
    Route::get('/api/dashboard/metrics', [\App\Http\Controllers\Admin\DashboardController::class, 'getMetrics'])->name('dashboard.metrics');

    // Feedback & Review management
    Route::get('/feedback', [\App\Http\Controllers\Admin\FeedbackController::class, 'index'])->name('feedback.index');
    Route::get('/feedback/search', [\App\Http\Controllers\Admin\FeedbackController::class, 'search'])->name('feedback.search');
    Route::delete('/feedback/{id}', [\App\Http\Controllers\Admin\FeedbackController::class, 'destroy'])->name('feedback.destroy');
});

require __DIR__.'/auth.php';
