<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningCategory extends Model
{
    protected $fillable = ['name', 'description'];

    /**
     * Get the learning materials for this category
     * Note: Uses string matching on 'category' field since the foreign key was removed
     */
    public function materials(): HasMany
    {
        return $this->hasMany(LearningMaterial::class, 'category', 'name');
    }
}
