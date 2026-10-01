<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaderboardHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'rank',
        'total_marks',
        'total_quizzes',
        'streak_count',
        'reset_date',
    ];

    protected $casts = [
        'reset_date' => 'datetime',
    ];

    /**
     * Get the user that owns this history record
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
