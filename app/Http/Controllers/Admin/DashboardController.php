<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private DashboardService $dashboardService;

    /* Set up the dashboard service when this controller starts */
    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /* Show the admin dashboard page with all the important numbers */
    public function index(): Response
    {
        /* Get all the stats from the dashboard service */
        $metrics = $this->dashboardService->getDashboardMetrics();
        $keyMetrics = $metrics['key_metrics'];

        /* Show the admin dashboard with all the counts */
        return Inertia::render('Admin/Dashboard', [
            'dashboardStats' => [
                'total_users' => $keyMetrics['total_users'] ?? 0,
                'total_quizzes' => $keyMetrics['total_quizzes'] ?? 0,
                'total_learning_materials' => $keyMetrics['total_learning_materials'] ?? 0,
                'dictionary_entries' => $keyMetrics['dictionary_entries'] ?? 0,
                'total_feedback' => $keyMetrics['total_feedback'] ?? 0,
                'total_issues' => $keyMetrics['total_issues'] ?? 0,
            ],
        ]);
    }

    /* Send back all the dashboard numbers as JSON */
    public function getMetrics(): JsonResponse
    {
        try {
            /* Get the metrics from the service */
            $metrics = $this->dashboardService->getDashboardMetrics();
            return response()->json([
                'success' => true,
                'data' => $metrics,
            ]);
        } catch (\Exception $e) {
            /* If something goes wrong, write it to the log file */
            \Log::error('Error fetching dashboard metrics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch dashboard metrics',
            ], 500);
        }
    }
}
