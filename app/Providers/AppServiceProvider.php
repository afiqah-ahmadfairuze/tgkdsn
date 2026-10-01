<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Set strong password requirements for all registration/reset operations
        Password::defaults(function () {
            return Password::min(8)              // Minimum 8 characters
                ->letters()                       // At least one letter (a-z, A-Z)
                ->mixedCase()                     // At least one uppercase AND one lowercase
                ->numbers()                       // At least one number (0-9)
                ->uncompromised();                // Not in known data breaches (haveibeenpwned.com)
        });
    }
}
