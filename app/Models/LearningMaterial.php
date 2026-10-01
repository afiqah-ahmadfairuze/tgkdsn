<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningMaterial extends Model
{
    protected $fillable = ['title', 'description', 'category', 'cover_image'];

    protected $appends = ['flashcards_count'];

    /**
     * Get all flashcards for this material
     */
    public function flashcards(): HasMany
    {
        return $this->hasMany(Flashcard::class, 'material_id');
    }

    /**
     * Get the flashcards count attribute
     */
    public function getFlashcardsCountAttribute(): int
    {
        return $this->flashcards()->count();
    }
}
