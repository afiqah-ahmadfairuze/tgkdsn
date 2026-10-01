<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to ensure only administrators can access admin routes
 *
 * Security Features:
 * - Checks user authentication status
 * - Verifies user has 'administrator' role
 * - Logs unauthorized access attempts
 * - Redirects non-admin users with error message
 * - CSRF protection (handled by Laravel's middleware stack)
 */
class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            // Log unauthorized access attempt
            Log::warning('Unauthenticated user attempted to access admin panel', [
                'ip' => $request->ip(),
                'url' => $request->fullUrl(),
                'user_agent' => $request->userAgent(),
            ]);

            // Redirect to login with intended URL
            return redirect()->route('login')
                ->with('error', 'Please log in to access the admin panel.')
                ->with('intended', $request->fullUrl());
        }

        // Check if user has administrator role
        if (Auth::user()->role !== 'admin') {
            // Log unauthorized access attempt by authenticated non-admin user
            Log::warning('Non-admin user attempted to access admin panel', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()->email,
                'user_role' => Auth::user()->role,
                'ip' => $request->ip(),
                'url' => $request->fullUrl(),
            ]);

            // Redirect to dashboard with error message
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to access the admin panel.');
        }

        // Log successful admin access for audit trail
        if ($request->isMethod('post') || $request->isMethod('put') ||
            $request->isMethod('patch') || $request->isMethod('delete')) {
            Log::info('Admin action performed', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()->email,
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'ip' => $request->ip(),
            ]);
        }

        // User is authenticated and is an administrator
        return $next($request);
    }
}
