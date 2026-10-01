<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DictionaryCategory extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get all dictionary entries in this category
     */
    public function entries(): HasMany
    {
        return $this->hasMany(DictionaryEntry::class, 'dictionary_category_id');
    }
}
