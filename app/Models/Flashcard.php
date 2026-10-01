<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Flashcard extends Model
{
    protected $fillable = ['material_id', 'word', 'description', 'description_eng', 'image'];

    /**
     * Get the material that this flashcard belongs to
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(LearningMaterial::class, 'material_id');
    }
}
