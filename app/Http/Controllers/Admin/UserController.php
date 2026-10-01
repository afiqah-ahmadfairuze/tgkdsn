<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /* Show the list of all students in the system */
    public function index(Request $request)
    {
        /* Check if the admin is searching for someone */
        $search = $request->input('search');

        /* Get all students (not admins) and let the admin search them */
        $users = User::where('role', 'user')
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('user_id', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'user_id' => $user->user_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'birthday' => $user->birthday ? $user->birthday->format('Y-m-d') : null,
                    'age' => $user->age,
                    'gender' => $user->gender,
                    'guardian_fullname' => $user->guardian_fullname,
                    'guardian_phone' => $user->guardian_phone,
                    'guardian_email' => $user->guardian_email,
                    'date_registered' => $user->created_at->format('Y-m-d'),
                ];
            });

        /* Show the admin the user management page */
        return Inertia::render('Admin/Users', [
            'users' => $users,
            'search' => $search,
        ]);
    }

    /* Update a student's information */
    public function update(Request $request, string $id)
    {
        /* Find the student */
        $user = User::findOrFail($id);

        /* Don't allow editing admin accounts */
        if ($user->role === 'administrator') {
            return redirect()->back()->with('error', 'Cannot edit administrator accounts.');
        }

        /* Make sure the new info is valid */
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        /* Save the changes */
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /* Delete one or more student accounts */
    public function destroy(Request $request)
    {
        /* Get the list of students to delete */
        $userIds = $request->input('user_ids', []);

        /* Make sure they selected at least one student */
        if (empty($userIds)) {
            return response()->json(['success' => false, 'message' => 'No users selected for deletion.'], 422);
        }

        /* Don't let them delete their own account */
        if (in_array(auth()->id(), $userIds)) {
            return response()->json(['success' => false, 'message' => 'You cannot delete your own account.'], 422);
        }

        /* Don't let them delete admin accounts */
        $adminCount = User::whereIn('id', $userIds)->where('role', 'administrator')->count();
        if ($adminCount > 0) {
            return response()->json(['success' => false, 'message' => 'Cannot delete administrator accounts.'], 422);
        }

        /* Delete the students and tell the admin how many were deleted */
        $deletedCount = User::whereIn('id', $userIds)->delete();
        $message = $deletedCount === 1 ? 'User deleted successfully.' : "{$deletedCount} users deleted successfully.";

        return response()->json(['success' => true, 'message' => $message]);
    }

    /* Get statistics about students for the admin dashboard */
    public function analytics(Request $request)
    {
        /* See what filters the admin wants to use */
        $userType = $request->input('user_type', 'all');
        $ageRange = $request->input('age_range', 'all');
        $timeRange = $request->input('time_range', 'week');

        /* Helper to filter students by gender and age */
        $applyFilters = function ($query) use ($userType, $ageRange) {
            /* Filter by gender if they picked one */
            if ($userType === 'male') {
                $query->where('gender', 'Male');
            } elseif ($userType === 'female') {
                $query->where('gender', 'Female');
            }

            /* Filter by school year (based on age) */
            if ($ageRange === 'year1') {
                $query->where('age', 7);
            } elseif ($ageRange === 'year2') {
                $query->where('age', 8);
            } elseif ($ageRange === 'year3') {
                $query->where('age', 9);
            } elseif ($ageRange === 'year4') {
                $query->where('age', 10);
            } elseif ($ageRange === 'year5') {
                $query->where('age', 11);
            } elseif ($ageRange === 'year6') {
                $query->where('age', 12);
            }

            return $query;
        };

        /* Figure out the date range they want to see */
        $now = Carbon::now();
        if ($timeRange === 'today') {
            $startDate = $now->clone()->startOfDay();
            $endDate = $now->clone()->endOfDay();
        } elseif ($timeRange === 'week') {
            $startDate = $now->clone()->startOfWeek();
            $endDate = $now->clone()->endOfDay();
        } elseif ($timeRange === 'month') {
            $startDate = $now->clone()->startOfMonth();
            $endDate = $now->clone()->endOfDay();
        } else {
            /* Show everything since the beginning */
            $startDate = Carbon::create(2000, 1, 1);
            $endDate = $now->clone()->endOfDay();
        }

        /* Count total students based on filters */
        $totalUserQuery = User::where('role', 'user');
        $totalUserQuery = $applyFilters($totalUserQuery);
        $totalUserCount = $totalUserQuery->whereBetween('created_at', [$startDate, $endDate])->count();

        /* Get list of new students who joined during this time */
        $newUsersQuery = User::where('role', 'user');
        $newUsersQuery = $applyFilters($newUsersQuery);

        $newUsers = $newUsersQuery
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('id', 'name', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'name' => $user->name,
                    'date' => $user->created_at->format('Y-m-d'),
                ];
            })
            ->toArray();

        /* Send back the stats to the admin */
        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $totalUserCount,
                'new_users' => $newUsers,
            ],
        ]);
    }
}
