import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminNavigation from '@/Components/AdminNavigation';
import { PageProps } from '@/types';

interface User {
    id: number;
    user_id: string;
    name: string;
    email: string;
    birthday: string | null;
    age: number | null;
    gender: string | null;
    guardian_fullname: string | null;
    guardian_phone: string | null;
    guardian_email: string | null;
    date_registered: string;
}

interface Stats {
    total_users: number;
    male_count: number;
    female_count: number;
    age_groups: {
        under_10: number;
        '10_to_15': number;
        '16_to_20': number;
        above_20: number;
    };
}

interface ReportData {
    users: User[];
    stats: Stats;
    report_criteria: {
        report_type: 'overall' | 'monthly' | 'custom';
        month?: string;
        start_date?: string;
        end_date?: string;
        age_filter?: number | null;
        gender_filter?: string | null;
    };
}

interface ReportViewPageProps extends PageProps {
    users: User[];
    stats: Stats;
    criteria: any;
}

export default function ReportView({ auth }: ReportViewPageProps) {
    const [reportData, setReportData] = useState<ReportData | null>(null);

    useEffect(() => {
        // Get report data from sessionStorage
        const storedData = sessionStorage.getItem('reportData');
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                setReportData(data);
            } catch (error) {
                console.error('Error parsing report data:', error);
            }
        } else {
            // Redirect back if no report data
            router.visit(route('admin.users.index'));
        }
    }, []);

    if (!reportData) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-gray-600">Loading report...</div>
            </div>
        );
    }

    const { users, stats, report_criteria } = reportData;
    const reportTitle = getReportTitle(report_criteria);

    function getReportTitle(criteria: any): string {
        const type = criteria.report_type;
        if (type === 'overall') {
            return 'Overall User Report';
        } else if (type === 'monthly' && criteria.month) {
            const date = new Date(criteria.month + '-01');
            return `User Report - ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
        } else if (type === 'custom' && criteria.start_date && criteria.end_date) {
            return `User Report - ${criteria.start_date} to ${criteria.end_date}`;
        }
        return 'User Report';
    }

    function handleDownloadPdf() {
        // Trigger the download
        const reportType = report_criteria.report_type;
        const data = {
            report_type: reportType,
            month: reportType === 'monthly' ? report_criteria.month : null,
            start_date: reportType === 'custom' ? report_criteria.start_date : null,
            end_date: reportType === 'custom' ? report_criteria.end_date : null,
            age_filter: report_criteria.age_filter,
            gender_filter: report_criteria.gender_filter,
        };

        fetch(route('admin.reports.export-pdf'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify(data),
        }).then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('Failed to download report');
        }).then(html => {
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report_${reportType}_${new Date().getTime()}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }).catch(error => {
            console.error('Error:', error);
            alert('Error downloading report');
        });
    }

    return (
        <>
            <Head title="User Report - Admin Panel" />
            <div className="min-h-screen bg-gray-100">
                <AdminNavigation auth={auth} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Report Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{reportTitle}</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDownloadPdf}
                                className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition"
                            >
                                Download PDF
                            </button>
                            <button
                                onClick={() => router.visit(route('admin.users.index'))}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 transition"
                            >
                                Back to Users
                            </button>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-600 text-sm mb-2">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-600 text-sm mb-2">Male</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.male_count}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-600 text-sm mb-2">Female</p>
                            <p className="text-3xl font-bold text-pink-600">{stats.female_count}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-600 text-sm mb-2">Other/Not Specified</p>
                            <p className="text-3xl font-bold text-gray-600">{stats.total_users - stats.male_count - stats.female_count}</p>
                        </div>
                    </div>

                    {/* Age Groups */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Age Groups</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{stats.age_groups.under_10}</p>
                                <p className="text-sm text-gray-600">Under 10</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{stats.age_groups['10_to_15']}</p>
                                <p className="text-sm text-gray-600">10-15 years</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{stats.age_groups['16_to_20']}</p>
                                <p className="text-sm text-gray-600">16-20 years</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{stats.age_groups.above_20}</p>
                                <p className="text-sm text-gray-600">Above 20</p>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-x-auto overflow-y-auto" style={{ maxHeight: '70vh' }}>
                        <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1400px' }}>
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left whitespace-nowrap sticky left-0 bg-gray-50 z-10 text-xs font-medium text-gray-700 uppercase">User ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">Age</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">Gender</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">Birthday</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">Guardian Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">Guardian Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">Guardian Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">Registered</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                                            No users found matching the criteria
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white z-10">{user.user_id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{user.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{user.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{user.age || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{user.gender || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{user.birthday || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{user.guardian_fullname || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{user.guardian_phone || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{user.guardian_email || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{user.date_registered}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
