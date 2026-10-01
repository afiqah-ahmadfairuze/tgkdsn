<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserStreak extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'current_streak',
        'last_quiz_date',
    ];

    protected $casts = [
        'last_quiz_date' => 'date',
    ];

    /**
     * Get the user that owns this streak record
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
