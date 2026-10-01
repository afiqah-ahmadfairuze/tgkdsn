<?php

namespace App\Http\Controllers;

use App\Models\DictionaryEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/*
 * BorosBank dictionary search and translation API
 * Supports Dusun, Bahasa Melayu, and English
 */
class DictionaryController extends Controller
{
    /* Search for words in the dictionary */
    public function search(Request $request): JsonResponse
    {
        /* Make sure they typed something and picked languages */
        $request->validate([
            'q' => ['required', 'string', 'min:1'],
            'source_language' => ['required', 'string', 'in:Dusun,Bahasa Melayu,English'],
            'target_language' => ['required', 'string', 'in:Dusun,Bahasa Melayu,English'],
        ]);

        /* Get what they typed and make it lowercase for searching */
        $query = strtolower($request->input('q'));
        $sourceLanguage = $request->input('source_language');
        $targetLanguage = $request->input('target_language');

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
                    /* Increment search count each time this word is searched */
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
                    /* Increment search count each time this word is searched */
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
                    /* Increment search count each time this word is searched */
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

    /* Show all the language options you can translate between */
    public function getLanguageCombinations(): JsonResponse
    {
        /* List of all translation options */
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

        /* Send back the list */
        return response()->json(['combinations' => $combinations]);
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
