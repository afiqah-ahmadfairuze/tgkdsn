import { Head } from '@inertiajs/react';
import AdminNavigation from '@/Components/AdminNavigation';

export default function Report() {
    return (
        <>
            <Head title="Report - Admin Panel" />
            <div className="min-h-screen bg-gray-100">
                <AdminNavigation />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Heading */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Report</h1>
                        <p className="mt-2 text-sm text-gray-600">View and manage user reports and analytics</p>
                    </div>
                </div>
            </div>
        </>
    );
}
