<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    protected $fillable = [
        'title',
        'description',
        'category',
        'total_marks',
        'is_available',
        'cover_image',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    public function questions()
    {
        return $this->hasMany(QuizQuestion::class);
    }

    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
