<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $table = 'feedbacks';

    protected $fillable = [
        'user_id',
        'language',
        'ease_of_use',
        'learned_words',
        'quiz_fun',
        'virtual_tour',
        'favourite_part',
        'improvements',
        'issue_reported',
        'issue_type',
        'issue_details',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
