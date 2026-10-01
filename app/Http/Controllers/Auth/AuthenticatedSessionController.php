<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'csrf_token' => csrf_token(),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Redirect based on user role
        $user = Auth::user();

        // For administrators, redirect to admin dashboard
        if ($user && $user->role === 'admin') {
            // Check if there's an intended URL, but only use it if it's an admin route
            $intended = session('url.intended');
            if ($intended && str_starts_with($intended, url('/admin'))) {
                return redirect()->intended(route('admin.dashboard'));
            }
            return redirect()->route('admin.dashboard');
        }

        // For regular users, redirect to home page with all features enabled
        // Check if there's an intended URL (user tried to access protected route)
        $intended = session('url.intended');
        if ($intended && !str_starts_with($intended, url('/admin'))) {
            return redirect()->intended(route('home'));
        }

        return redirect()->route('home')->with('success', 'Welcome back!');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
