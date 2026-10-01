import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminNavigation from '@/Components/AdminNavigation';
import ReportViewer from '@/Components/ReportViewer';

interface Report {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
}

export default function Reports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/admin/api/reports');
            const data = await response.json();

            if (data.success) {
                setReports(data.reports);
            } else {
                setError('Failed to load reports');
            }
        } catch (err) {
            setError('Error loading reports');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (selectedReport) {
        return (
            <>
                <Head title="Reports - Admin Panel" />
                <div className="min-h-screen bg-gray-100">
                    <div className="print:hidden">
                        <AdminNavigation />
                    </div>
                    <ReportViewer
                        reportType={selectedReport}
                        onBack={() => setSelectedReport(null)}
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Reports - Admin Panel" />
            <div className="min-h-screen bg-gray-100">
                <div className="print:hidden">
                    <AdminNavigation />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Heading */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                        <p className="mt-2 text-sm text-gray-600">Generate and export detailed reports on platform performance, user engagement, and content analytics</p>
                    </div>

                    <div className="flex gap-8">
                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                    {error}
                                </div>
                            )}

                            {/* Loading State */}
                            {isLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="text-gray-500">Loading reports...</div>
                                </div>
                            ) : (
                                <>
                                    {/* Reports Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {reports.map((report) => (
                                            <button
                                                key={report.id}
                                                onClick={() => setSelectedReport(report.id)}
                                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 text-left"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="text-4xl">{report.icon}</div>
                                                    <span className="text-xs font-semibold text-tgkdsn-yellow bg-yellow-50 px-2.5 py-1 rounded-full">
                                                        {report.category}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                    {report.name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {report.description}
                                                </p>
                                                <div className="mt-4 flex items-center text-tgkdsn-yellow font-medium text-sm hover:text-tgkdsn-yellow-dark">
                                                    View Report →
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Empty State */}
                                    {reports.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">No reports available</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-80">
                            <div className="sticky top-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-md p-6 border border-blue-100 space-y-6">
                                {/* About Reports */}
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <span>📊</span> About Reports
                                    </h3>
                                    <p className="text-sm text-gray-700">
                                        Generate comprehensive reports to analyze platform usage, track user engagement, monitor quiz performance, and make data-driven decisions.
                                    </p>
                                </div>

                                {/* Print to PDF */}
                                <div className="border-t border-blue-200 pt-6">
                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <span>🖨️</span> Print to PDF
                                    </h3>
                                    <p className="text-sm text-gray-700">
                                        All reports can be printed directly from your browser. Click the "Print / Save as PDF" button to save reports as PDF files.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
