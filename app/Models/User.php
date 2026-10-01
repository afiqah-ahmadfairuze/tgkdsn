<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'email',
        'password',
        'role',
        'profile_picture',
        'birthday',
        'age',
        'gender',
        'guardian_fullname',
        'guardian_phone',
        'guardian_email',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birthday' => 'date',
        ];
    }

    /**
     * Get the quiz attempts for this user
     */
    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    /**
     * Get the streak record for this user
     */
    public function streak()
    {
        return $this->hasOne(UserStreak::class);
    }
    /**
     * Send the email verification notification using Brevo API
     */
    public function sendEmailVerificationNotification()
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $this->getKey(),
                'hash' => sha1($this->getEmailForVerification()),
            ]
        );

        Http::withHeaders([
            'api-key' => config('services.brevo.key'),
        ])->post('https://api.brevo.com/v3/smtp/email', [
            'sender' => [
                'name' => 'TanganakDusun',
                'email' => 'no-reply@tanganakdusun.org',
            ],
            'to' => [
                ['email' => $this->email],
            ],
            'subject' => 'Verify your email address',
            'htmlContent' => "
                <p>Hi {$this->name},</p>
                <p>Please click the link below to verify your email:</p>
                <p><a href='{$verificationUrl}'>Verify Email</a></p>
                <p>If you did not create an account, no action is required.</p>
            ",
        ]);
    }

    /**
     * Get the leaderboard history records for this user
     */
    public function leaderboardHistories()
    {
        return $this->hasMany(LeaderboardHistory::class);
    }

    /**
     * Get the bonus points awarded to this user
     */
    public function bonusPointsReceived()
    {
        return $this->hasMany(BonusPoints::class);
    }

    /**
     * Get the bonus points awarded by this admin
     */
    public function bonusPointsAwarded()
    {
        return $this->hasMany(BonusPoints::class, 'admin_id');
    }

    /**
     * Calculate age from birthday
     */
    public function calculateAge()
    {
        if (!$this->birthday) {
            return null;
        }
        return now()->diffInYears($this->birthday);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->user_id)) {
                // Get the last user's ID
                $lastUser = static::orderBy('id', 'desc')->first();
                $nextId = $lastUser ? $lastUser->id + 1 : 1;
                $user->user_id = 'U' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
            }
        });
    }
}
