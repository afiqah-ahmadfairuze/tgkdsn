<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DictionaryEntry;
use App\Models\DictionaryCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DictionaryController extends Controller
{
    /* Show the admin all dictionary words */
    public function index(Request $request): Response
    {
        /* Check if the admin is searching or filtering */
        $search = $request->input('search', '');
        $categoryFilter = $request->input('category', null);

        /* Get all dictionary entries and apply search/filters */
        $entries = DictionaryEntry::with('category')
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->whereRaw('LOWER(dusun_word) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(bm_translation) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(en_translation) LIKE ?', ["%{$search}%"]);
                });
            })
            ->when($categoryFilter, function ($query, $categoryFilter) {
                return $query->where('dictionary_category_id', $categoryFilter);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($entry) {
                return [
                    'entry_id' => $entry->entry_id,
                    'dusun_word' => $entry->dusun_word,
                    'bm_translation' => $entry->bm_translation,
                    'en_translation' => $entry->en_translation,
                    'pronunciation' => $entry->pronunciation,
                    'dusun_example_sentence' => $entry->dusun_example_sentence,
                    'bm_example_translation' => $entry->bm_example_translation,
                    'en_example_translation' => $entry->en_example_translation,
                    'word_picture' => $entry->word_picture ? asset('storage/word_pictures/' . $entry->word_picture) : null,
                    'category_id' => $entry->dictionary_category_id,
                    'category_name' => $entry->category?->name,
                    'search_count' => $entry->search_count,
                ];
            });

        /* Get the list of categories */
        $categories = DictionaryCategory::orderBy('name')->get()->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
            ];
        });

        /* Count total words */
        $totalWords = DictionaryEntry::when($categoryFilter, function ($query, $categoryFilter) {
            return $query->where('dictionary_category_id', $categoryFilter);
        })->count();

        /* Find the most searched words (only those with at least 1 search) */
        $topSearched = DictionaryEntry::when($categoryFilter, function ($query, $categoryFilter) {
            return $query->where('dictionary_category_id', $categoryFilter);
        })
            ->where('search_count', '>', 0)
            ->orderBy('search_count', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($entry) {
                return [
                    'dusun_word' => $entry->dusun_word,
                    'search_count' => $entry->search_count,
                ];
            });

        /* Show the admin the dictionary management page */
        return Inertia::render('Admin/Dictionary', [
            'entries' => $entries,
            'categories' => $categories,
            'search' => $search,
            'categoryFilter' => $categoryFilter,
            'overview' => [
                'total_words' => $totalWords,
                'top_searched' => $topSearched,
            ],
        ]);
    }

    /* Create a new word category */
    public function storeCategory(Request $request)
    {
        /* Make sure the category info is valid */
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:dictionary_categories,name'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        /* Save the new category */
        DictionaryCategory::create($validated);

        return response()->json(['success' => true, 'message' => 'Category created successfully.']);
    }

    /* Update a word category */
    public function updateCategory(Request $request, int $id)
    {
        /* Find the category */
        $category = DictionaryCategory::findOrFail($id);

        /* Make sure the new info is valid */
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:dictionary_categories,name,' . $id],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        /* Save the changes */
        $category->update($validated);

        return response()->json(['success' => true, 'message' => 'Category updated successfully.']);
    }

    /* Delete a word category */
    public function destroyCategory(int $id)
    {
        /* Find the category */
        $category = DictionaryCategory::findOrFail($id);

        /* Remove this category from all words that use it */
        DictionaryEntry::where('dictionary_category_id', $id)->update(['dictionary_category_id' => null]);

        /* Delete the category */
        $category->delete();

        return response()->json(['success' => true, 'message' => 'Category deleted successfully.']);
    }

    /* Add a new word to the dictionary */
    public function store(Request $request)
    {
        /* Make sure all the word info is valid */
        $validated = $request->validate([
            'dusun_word' => ['required', 'string', 'max:255', 'unique:dictionary_entries,dusun_word'],
            'bm_translation' => ['required', 'string', 'max:255'],
            'en_translation' => ['nullable', 'string', 'max:255'],
            'pronunciation' => ['nullable', 'string', 'max:255'],
            'dusun_example_sentence' => ['nullable', 'string'],
            'bm_example_translation' => ['nullable', 'string'],
            'en_example_translation' => ['nullable', 'string'],
            'word_picture' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:5120'],
            'dictionary_category_id' => ['nullable', 'exists:dictionary_categories,id'],
        ]);

        /* Save the word picture if they uploaded one */
        $picturePath = null;
        if ($request->hasFile('word_picture')) {
            $file = $request->file('word_picture');
            $picturePath = $file->store('word_pictures', 'public');
            $validated['word_picture'] = basename($picturePath);
        }

        /* Add the word to the dictionary */
        DictionaryEntry::create($validated);

        return response()->json(['success' => true, 'message' => 'Dictionary entry added successfully.']);
    }

    /* Update a dictionary word */
    public function update(Request $request, int $entry_id)
    {
        /* Find the word */
        $entry = DictionaryEntry::findOrFail($entry_id);

        /* Make sure the new info is valid */
        $validated = $request->validate([
            'dusun_word' => ['required', 'string', 'max:255', 'unique:dictionary_entries,dusun_word,' . $entry_id . ',entry_id'],
            'bm_translation' => ['required', 'string', 'max:255'],
            'en_translation' => ['nullable', 'string', 'max:255'],
            'pronunciation' => ['nullable', 'string', 'max:255'],
            'dusun_example_sentence' => ['nullable', 'string'],
            'bm_example_translation' => ['nullable', 'string'],
            'en_example_translation' => ['nullable', 'string'],
            'word_picture' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:5120'],
            'dictionary_category_id' => ['nullable', 'exists:dictionary_categories,id'],
        ]);

        /* Handle the word picture */
        if ($request->hasFile('word_picture')) {
            /* Delete the old picture if it exists */
            if ($entry->word_picture) {
                $oldPath = storage_path('app/public/word_pictures/' . $entry->word_picture);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            /* Save the new picture */
            $file = $request->file('word_picture');
            $picturePath = $file->store('word_pictures', 'public');
            $validated['word_picture'] = basename($picturePath);
        } else {
            /* Keep the existing picture if no new one was uploaded */
            unset($validated['word_picture']);
        }

        /* Save the changes */
        $entry->update($validated);

        return response()->json(['success' => true, 'message' => 'Dictionary entry updated successfully.']);
    }

    /* Delete one or more dictionary words */
    public function destroy(Request $request)
    {
        /* Get the list of words to delete */
        $entryIds = $request->input('entry_ids', []);

        /* Make sure they selected at least one word */
        if (empty($entryIds)) {
            return response()->json(['success' => false, 'message' => 'No entries selected for deletion.'], 422);
        }

        /* Make sure it's an array */
        if (!is_array($entryIds)) {
            $entryIds = [$entryIds];
        }

        /* Get all the words that will be deleted */
        $entries = DictionaryEntry::whereIn('entry_id', $entryIds)->get();

        /* Delete all the word pictures */
        foreach ($entries as $entry) {
            if ($entry->word_picture) {
                $picturePath = storage_path('app/public/word_pictures/' . $entry->word_picture);
                if (file_exists($picturePath)) {
                    unlink($picturePath);
                }
            }
        }

        /* Delete all the words */
        $deletedCount = DictionaryEntry::whereIn('entry_id', $entryIds)->delete();

        /* Tell the admin how many were deleted */
        $message = $deletedCount === 1
            ? 'Dictionary entry deleted successfully.'
            : "{$deletedCount} dictionary entries deleted successfully.";

        return response()->json(['success' => true, 'message' => $message]);
    }

    /* Get the list of language translation options for students */
    public function getLanguageCombinations()
    {
        /* List all the ways students can translate words */
        $combinations = [
            [
                'id' => 'bm-to-dusun',
                'source' => 'Bahasa Melayu',
                'target' => 'Dusun',
                'label' => 'BM → Dusun',
            ],
            [
                'id' => 'en-to-dusun',
                'source' => 'English',
                'target' => 'Dusun',
                'label' => 'EN → Dusun',
            ],
            [
                'id' => 'dusun-to-bm',
                'source' => 'Dusun',
                'target' => 'Bahasa Melayu',
                'label' => 'Dusun → BM',
            ],
            [
                'id' => 'dusun-to-en',
                'source' => 'Dusun',
                'target' => 'English',
                'label' => 'Dusun → EN',
            ],
        ];

        return response()->json(['combinations' => $combinations]);
    }

    /* Search for words in the dictionary (used by students) */
    public function search(Request $request)
    {
        /* Get what the student is searching for */
        $query = strtolower($request->input('q', ''));
        $sourceLanguage = $request->input('source_language', '');
        $targetLanguage = $request->input('target_language', '');

        /* If anything is missing, send back empty results */
        if (!$query || !$sourceLanguage || !$targetLanguage) {
            return response()->json(['results' => []]);
        }

        $results = [];

        /* Check which language they're searching from */
        if ($sourceLanguage === 'Dusun') {
            /* Look for the word in Dusun words */
            $results = DictionaryEntry::whereRaw('LOWER(dusun_word) LIKE ?', ["%{$query}%"])
                ->get()
                ->map(function ($entry) use ($targetLanguage) {
                    /* Count how many times this word was searched */
                    $entry->increment('search_count');

                    return [
                        'entry_id' => $entry->entry_id,
                        'word' => $this->getTranslationByTarget($entry, $targetLanguage),
                        'pronunciation' => $entry->pronunciation,
                        'example_sentence' => $entry->dusun_example_sentence,
                        'example_translation' => $this->getExampleByTarget($entry, $targetLanguage),
                        'word_picture' => $entry->word_picture ? asset('storage/word_pictures/' . $entry->word_picture) : null,
                    ];
                })
                ->toArray();
        } elseif ($sourceLanguage === 'Bahasa Melayu') {
            /* Look for the word in Bahasa Melayu translations */
            $results = DictionaryEntry::whereRaw('LOWER(bm_translation) LIKE ?', ["%{$query}%"])
                ->get()
                ->map(function ($entry) use ($targetLanguage) {
                    /* Count how many times this word was searched */
                    $entry->increment('search_count');

                    return [
                        'entry_id' => $entry->entry_id,
                        'word' => $this->getTranslationByTarget($entry, $targetLanguage),
                        'pronunciation' => $entry->pronunciation,
                        'example_sentence' => $entry->bm_example_translation,
                        'example_translation' => $this->getExampleByTarget($entry, $targetLanguage),
                        'word_picture' => $entry->word_picture ? asset('storage/word_pictures/' . $entry->word_picture) : null,
                    ];
                })
                ->toArray();
        } elseif ($sourceLanguage === 'English') {
            /* Look for the word in English translations */
            $results = DictionaryEntry::whereRaw('LOWER(en_translation) LIKE ?', ["%{$query}%"])
                ->get()
                ->map(function ($entry) use ($targetLanguage) {
                    /* Count how many times this word was searched */
                    $entry->increment('search_count');

                    return [
                        'entry_id' => $entry->entry_id,
                        'word' => $this->getTranslationByTarget($entry, $targetLanguage),
                        'pronunciation' => $entry->pronunciation,
                        'example_sentence' => $entry->en_example_translation,
                        'example_translation' => $this->getExampleByTarget($entry, $targetLanguage),
                        'word_picture' => $entry->word_picture ? asset('storage/word_pictures/' . $entry->word_picture) : null,
                    ];
                })
                ->toArray();
        }

        /* Send back what we found */
        return response()->json(['results' => $results]);
    }

    /* Pick which translation to show based on the language they want */
    private function getTranslationByTarget($entry, $targetLanguage)
    {
        return match ($targetLanguage) {
            'Dusun' => $entry->dusun_word,
            'Bahasa Melayu' => $entry->bm_translation,
            'English' => $entry->en_translation,
            default => $entry->bm_translation,
        };
    }

    /* Pick which example sentence to show based on the language they want */
    private function getExampleByTarget($entry, $targetLanguage)
    {
        return match ($targetLanguage) {
            'Dusun' => $entry->dusun_example_sentence,
            'Bahasa Melayu' => $entry->bm_example_translation,
            'English' => $entry->en_example_translation,
            default => $entry->dusun_example_sentence,
        };
    }
}
