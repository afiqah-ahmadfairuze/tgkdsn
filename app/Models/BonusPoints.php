<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BonusPoints extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'admin_id',
        'points',
        'reason',
    ];

    /**
     * Get the user who received the bonus points
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who awarded the bonus points
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
