<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DictionaryEntry extends Model
{
    protected $primaryKey = 'entry_id';

    protected $fillable = [
        'dusun_word',
        'bm_translation',
        'en_translation',
        'pronunciation',
        'dusun_example_sentence',
        'bm_example_translation',
        'en_example_translation',
        'word_picture',
        'dictionary_category_id',
        'search_count',
    ];

    /**
     * Get the category for this entry
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(DictionaryCategory::class, 'dictionary_category_id');
    }
}
