<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/*
 * Handles user feedback submissions about the app
 */
class FeedbackController extends Controller
{
    /* Save student feedback about the app */
    public function store(Request $request): JsonResponse
    {
        /* Make sure they filled out all the required fields */
        $request->validate([
            'language' => ['required', 'string', 'in:en,bm'],
            'ease_of_use' => ['required', 'string'],
            'learned_words' => ['required', 'string'],
            'quiz_fun' => ['required', 'string'],
            'virtual_tour' => ['required', 'string'],
            'favourite_part' => ['nullable', 'string', 'max:500'],
            'improvements' => ['nullable', 'string', 'max:500'],
            'issue_reported' => ['boolean'],
            'issue_type' => ['nullable', 'string', 'max:255'],
            'issue_details' => ['nullable', 'string', 'max:500'],
        ]);

        /* Save their feedback to the database */
        $feedback = Feedback::create([
            'user_id' => auth()->id(),
            'language' => $request->input('language'),
            'ease_of_use' => $request->input('ease_of_use'),
            'learned_words' => $request->input('learned_words'),
            'quiz_fun' => $request->input('quiz_fun'),
            'virtual_tour' => $request->input('virtual_tour'),
            'favourite_part' => $request->input('favourite_part'),
            'improvements' => $request->input('improvements'),
            'issue_reported' => $request->input('issue_reported', false),
            'issue_type' => $request->input('issue_type'),
            'issue_details' => $request->input('issue_details'),
        ]);

        /* Thank them for their feedback */
        return response()->json([
            'success' => true,
            'message' => 'Feedback submitted successfully. Thank you!',
            'feedback' => $feedback,
        ], 201);
    }
}
