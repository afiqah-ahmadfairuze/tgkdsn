<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\User;
use Inertia\Response;

class FeedbackController extends Controller
{
    /* Show the admin all the feedback from students */
    public function index(): Response
    {
        /* Get the latest feedback (10 per page) */
        $feedbacks = Feedback::with('user')
            ->latest('created_at')
            ->paginate(10);

        /* Prepare each feedback with the student's name */
        $feedbacks->getCollection()->transform(function ($feedback) {
            return [
                'id' => $feedback->id,
                'user_id' => $feedback->user->id ?? null,
                'user_name' => $feedback->user->name ?? 'Deleted User',
                'language' => $feedback->language,
                'ease_of_use' => $feedback->ease_of_use,
                'learned_words' => $feedback->learned_words,
                'quiz_fun' => $feedback->quiz_fun,
                'virtual_tour' => $feedback->virtual_tour,
                'favourite_part' => $feedback->favourite_part,
                'improvements' => $feedback->improvements,
                'issue_reported' => $feedback->issue_reported,
                'issue_type' => $feedback->issue_type,
                'issue_details' => $feedback->issue_details,
                'created_at' => $feedback->created_at->format('Y-m-d H:i'),
            ];
        });

        /* Show the admin the feedback page */
        return inertia('Admin/Feedback', [
            'feedbacks' => $feedbacks,
            'languages' => [
                ['value' => 'en', 'label' => 'English'],
                ['value' => 'bm', 'label' => 'Bahasa Melayu'],
            ],
        ]);
    }

    /* Search and filter feedback */
    public function search()
    {
        /* Get all the filters the admin wants to use */
        $search = request('search', '');
        $language = request('language', '');
        $ease_of_use = request('ease_of_use', '');
        $learned_words = request('learned_words', '');
        $quiz_fun = request('quiz_fun', '');
        $virtual_tour = request('virtual_tour', '');

        /* Start building the search */
        $query = Feedback::with('user');

        /* Apply each filter if the admin selected it */
        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($language) {
            $query->where('language', $language);
        }

        if ($ease_of_use) {
            $query->where('ease_of_use', $ease_of_use);
        }

        if ($learned_words) {
            $query->where('learned_words', $learned_words);
        }

        if ($quiz_fun) {
            $query->where('quiz_fun', $quiz_fun);
        }

        if ($virtual_tour) {
            $query->where('virtual_tour', $virtual_tour);
        }

        /* Get the filtered feedback */
        $feedbacks = $query->latest('created_at')->paginate(10);

        /* Prepare each feedback */
        $feedbacks->getCollection()->transform(function ($feedback) {
            return [
                'id' => $feedback->id,
                'user_id' => $feedback->user->id ?? null,
                'user_name' => $feedback->user->name ?? 'Deleted User',
                'language' => $feedback->language,
                'ease_of_use' => $feedback->ease_of_use,
                'learned_words' => $feedback->learned_words,
                'quiz_fun' => $feedback->quiz_fun,
                'virtual_tour' => $feedback->virtual_tour,
                'favourite_part' => $feedback->favourite_part,
                'improvements' => $feedback->improvements,
                'issue_reported' => $feedback->issue_reported,
                'issue_type' => $feedback->issue_type,
                'issue_details' => $feedback->issue_details,
                'created_at' => $feedback->created_at->format('Y-m-d H:i'),
            ];
        });

        /* Show the filtered results */
        return inertia('Admin/Feedback', [
            'feedbacks' => $feedbacks,
            'languages' => [
                ['value' => 'en', 'label' => 'English'],
                ['value' => 'bm', 'label' => 'Bahasa Melayu'],
            ],
            'search' => $search,
            'language' => $language,
            'ease_of_use' => $ease_of_use,
            'learned_words' => $learned_words,
            'quiz_fun' => $quiz_fun,
            'virtual_tour' => $virtual_tour,
        ]);
    }

    /* Delete a feedback */
    public function destroy($id)
    {
        /* Find and delete the feedback */
        $feedback = Feedback::findOrFail($id);
        $feedback->delete();

        return response()->json(['success' => true, 'message' => 'Feedback deleted successfully'], 200);
    }
}
