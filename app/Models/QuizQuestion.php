<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizQuestion extends Model
{
    protected $fillable = [
        'quiz_id',
        'question_bm',
        'question_eng',
        'option_a',
        'option_b',
        'option_c',
        'option_d',
        'correct_answer',
        'question_image',
        'marks',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
