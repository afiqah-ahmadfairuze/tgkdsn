<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'csrf_token' => csrf_token(),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'birthday' => 'required|string|regex:/^\d{2}-\d{2}-\d{4}$/', // DD-MM-YYYY format
            'gender' => 'required|in:Male,Female',
            'guardian_fullname' => 'required|string|max:255',
            'guardian_phone' => 'required|string|regex:/^[0-9\-\+\(\)\s]+$/',
            'guardian_email' => 'required|email|max:255',
        ]);

        // Parse birthday from DD-MM-YYYY format to Y-m-d for database
        try {
            // Create Carbon instance from DD-MM-YYYY
            $birthdayDate = \Carbon\Carbon::createFromFormat('d-m-Y', $validated['birthday']);

            // Validate the date is valid
            if (!$birthdayDate || $birthdayDate->isFuture()) {
                return redirect()->back()->withErrors(['birthday' => 'Please enter a valid birthday in DD-MM-YYYY format.'])->withInput();
            }

            // Validate age is between 7-12 (Year 1 to Year 6)
            $age = $birthdayDate->diffInYears(\Carbon\Carbon::now());
            if ($age < 7 || $age > 12) {
                return redirect()->back()->withErrors(['birthday' => 'Student must be between 7-12 years old (Year 1 to Year 6). Current age: ' . $age])->withInput();
            }

            // Convert to Y-m-d format for database storage
            $birthdayFormatted = $birthdayDate->format('Y-m-d');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['birthday' => 'Invalid birthday format. Please use DD-MM-YYYY format.'])->withInput();
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'birthday' => $birthdayFormatted,
            'age' => $age,
            'gender' => $request->gender,
            'guardian_fullname' => $request->guardian_fullname,
            'guardian_phone' => $request->guardian_phone,
            'guardian_email' => $request->guardian_email,
            'role' => 'user', // All signups are normal users
        ]);

        event(new Registered($user));

        return redirect()->route('login')->with('status', 'Signup successful! Please log in with your credentials.');
    }
}
