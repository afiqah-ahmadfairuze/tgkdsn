import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavigation from '@/Components/AdminNavigation';
import ReportViewer from '@/Components/ReportViewer';
import { PageProps } from '@/types';
import { Users as UsersIcon, BarChart3, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface UsersPageProps extends PageProps {
    users: User[];
    search?: string;
}

interface MonthOption {
    value: string;
    label: string;
}

export default function Users({ auth, users: initialUsers, search }: UsersPageProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [reportType, setReportType] = useState<'overall' | 'monthly' | 'custom'>('overall');
    const [reportMonth, setReportMonth] = useState('');
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');
    const [ageFilter, setAgeFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const [availableMonths, setAvailableMonths] = useState<MonthOption[]>([]);

    // Analytics state for User Overview
    const [userType, setUserType] = useState<'all' | 'male' | 'female'>('all');
    const [ageRange, setAgeRange] = useState<'all' | 'year1' | 'year2' | 'year3' | 'year4' | 'year5' | 'year6'>('all');
    const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'overall'>('overall');
    const [totalUserCount, setTotalUserCount] = useState(0);
    const [newUsers, setNewUsers] = useState<{name: string, date: string}[]>([]);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // Print Report state
    const [showPrintReport, setShowPrintReport] = useState(false);
    const [reportUserType, setReportUserType] = useState<'all' | 'male' | 'female'>('all');
    const [reportAgeRange, setReportAgeRange] = useState<'all' | 'year1' | 'year2' | 'year3' | 'year4' | 'year5' | 'year6'>('all');
    const [reportTimeRange, setReportTimeRange] = useState<'today' | 'week' | 'month' | 'overall'>('overall');

    // New Users Modal state
    const [showNewUsersModal, setShowNewUsersModal] = useState(false);

    // Fetch analytics data on mount and when filters change
    useEffect(() => {
        fetchAnalyticsData();
    }, [userType, ageRange, timeRange]);

    const fetchAnalyticsData = async () => {
        try {
            setAnalyticsLoading(true);
            const response = await axios.get(route('admin.users.analytics'), {
                params: {
                    user_type: userType,
                    age_range: ageRange,
                    time_range: timeRange,
                }
            });
            if (response.data.success) {
                setTotalUserCount(response.data.data.total_users);
                setNewUsers(response.data.data.new_users || []);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            // Set fallback values
            setTotalUserCount(users.length);
            setNewUsers([]);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Fetch available months when modal opens
    useEffect(() => {
        if (showReportModal && reportType === 'monthly') {
            fetchAvailableMonths();
        }
    }, [showReportModal, reportType]);

    const fetchAvailableMonths = async () => {
        try {
            const response = await fetch(route('admin.reports.available-months'));
            if (response.ok) {
                const data = await response.json();
                setAvailableMonths(data.months || []);
            }
        } catch (error) {
            console.error('Error fetching available months:', error);
        }
    };

    // Handle checkbox selection
    const handleSelectUser = (userId: number) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    // Handle select all (using filtered users)
    const handleSelectAll = () => {
        const filteredIds = filteredUsers.map(u => u.id);
        if (selectedUsers.length === filteredUsers.length && filteredUsers.length > 0) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredIds);
        }
    };

    // Filter users based on selected filters (Gender, Year Level, and Period)
    const getFilteredUsers = () => {
        let filtered = users;

        // Apply gender filter
        if (userType === 'male') {
            filtered = filtered.filter(u => u.gender === 'Male');
        } else if (userType === 'female') {
            filtered = filtered.filter(u => u.gender === 'Female');
        }

        // Apply year level filter
        if (ageRange !== 'all' && ageRange) {
            filtered = filtered.filter(u => {
                if (!u.age) return false;
                if (ageRange === 'year1') return u.age === 7;
                if (ageRange === 'year2') return u.age === 8;
                if (ageRange === 'year3') return u.age === 9;
                if (ageRange === 'year4') return u.age === 10;
                if (ageRange === 'year5') return u.age === 11;
                if (ageRange === 'year6') return u.age === 12;
                return false;
            });
        }

        // Apply time range filter for Gender Distribution
        if (timeRange !== 'overall') {
            const now = new Date();
            const startDate = new Date();

            if (timeRange === 'today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (timeRange === 'week') {
                const day = now.getDay();
                startDate.setDate(now.getDate() - day);
                startDate.setHours(0, 0, 0, 0);
            } else if (timeRange === 'month') {
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
            }

            filtered = filtered.filter(u => new Date(u.date_registered) >= startDate);
        }

        return filtered;
    };

    const filteredUsers = getFilteredUsers();

    // Filter users for print report based on report filters
    const getReportFilteredUsers = () => {
        let filtered = users;

        // Apply gender filter
        if (reportUserType === 'male') {
            filtered = filtered.filter(u => u.gender === 'Male');
        } else if (reportUserType === 'female') {
            filtered = filtered.filter(u => u.gender === 'Female');
        }

        // Apply year level filter
        if (reportAgeRange !== 'all' && reportAgeRange) {
            filtered = filtered.filter(u => {
                if (!u.age) return false;
                if (reportAgeRange === 'year1') return u.age === 7;
                if (reportAgeRange === 'year2') return u.age === 8;
                if (reportAgeRange === 'year3') return u.age === 9;
                if (reportAgeRange === 'year4') return u.age === 10;
                if (reportAgeRange === 'year5') return u.age === 11;
                if (reportAgeRange === 'year6') return u.age === 12;
                return false;
            });
        }

        // Apply time range filter for new users
        if (reportTimeRange !== 'overall') {
            const now = new Date();
            const startDate = new Date();

            if (reportTimeRange === 'today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (reportTimeRange === 'week') {
                const day = now.getDay();
                startDate.setDate(now.getDate() - day);
                startDate.setHours(0, 0, 0, 0);
            } else if (reportTimeRange === 'month') {
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
            }

            filtered = filtered.filter(u => new Date(u.date_registered) >= startDate);
        }

        return filtered;
    };

    const reportFilteredUsers = getReportFilteredUsers();

    // Get report totals
    const getReportTotals = () => {
        return {
            total: reportFilteredUsers.length,
            male: reportFilteredUsers.filter(u => u.gender === 'Male').length,
            female: reportFilteredUsers.filter(u => u.gender === 'Female').length,
        };
    };

    const reportTotals = getReportTotals();

    // Get chart data - gender breakdown by year level
    const getChartData = () => {
        const yearLevels = [
            { year: 'Year 1', age: 7 },
            { year: 'Year 2', age: 8 },
            { year: 'Year 3', age: 9 },
            { year: 'Year 4', age: 10 },
            { year: 'Year 5', age: 11 },
            { year: 'Year 6', age: 12 },
        ];

        return yearLevels.map(level => {
            const yearUsers = reportFilteredUsers.filter(u => u.age === level.age);
            return {
                name: level.year,
                Male: yearUsers.filter(u => u.gender === 'Male').length,
                Female: yearUsers.filter(u => u.gender === 'Female').length,
            };
        });
    };

    const chartData = getChartData();

    // Format period display with dates
    const getFormattedPeriod = () => {
        const now = new Date();

        if (reportTimeRange === 'overall') {
            return 'Overall';
        } else if (reportTimeRange === 'today') {
            const todayStr = now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            return `Today (${todayStr})`;
        } else if (reportTimeRange === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const startStr = weekAgo.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            const endStr = now.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            return `This Week (${startStr} - ${endStr})`;
        } else if (reportTimeRange === 'month') {
            const monthStr = now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
            });
            return `This Month (${monthStr})`;
        }
        return 'Overall';
    };

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search: searchQuery }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle delete user
    const handleDeleteClick = () => {
        if (selectedUsers.length === 0) {
            alert('Please select at least one user to delete');
            return;
        }
        setShowDeleteConfirm(true);
    };

    // Confirm delete
    const handleDeleteConfirm = async () => {
        if (selectedUsers.length === 0) return;

        try {
            const response = await axios.delete(route('admin.users.destroy'), {
                data: { user_ids: selectedUsers },
            });

            if (response.data.success) {
                // Optimistically remove users from state
                setUsers(users.filter(u => !selectedUsers.includes(u.id)));
                setShowDeleteConfirm(false);
                setSelectedUsers([]);
                alert(response.data.message || 'Users deleted successfully!');

                // Refresh analytics to update overview
                fetchAnalyticsData();
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error deleting users';
            alert('Error: ' + errorMessage);
        }
    };

    // Handle view report
    const handleViewReport = async () => {
        setReportLoading(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            // Build payload with proper null handling for empty strings
            const payload = {
                report_type: reportType,
                month: reportType === 'monthly' && reportMonth ? reportMonth : null,
                start_date: reportType === 'custom' && reportStartDate ? reportStartDate : null,
                end_date: reportType === 'custom' && reportEndDate ? reportEndDate : null,
                age_filter: ageFilter ? parseInt(ageFilter) : null,
                gender_filter: genderFilter ? genderFilter : null,
            };

            console.log('Sending report payload:', payload);

            const response = await fetch(route('admin.reports.generate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                sessionStorage.setItem('reportData', JSON.stringify(data));
                window.location.href = route('admin.reports.view');
            } else {
                const errorMsg = data.errors ? Object.values(data.errors).flat().join(', ') : (data.message || 'Error generating report');
                alert('Error: ' + errorMsg);
                console.error('Report error:', data);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating report: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setReportLoading(false);
        }
    };

    // Handle download PDF
    const handleDownloadPdf = async () => {
        setReportLoading(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            // Build payload with proper null handling for empty strings
            const payload = {
                report_type: reportType,
                month: reportType === 'monthly' && reportMonth ? reportMonth : null,
                start_date: reportType === 'custom' && reportStartDate ? reportStartDate : null,
                end_date: reportType === 'custom' && reportEndDate ? reportEndDate : null,
                age_filter: ageFilter ? parseInt(ageFilter) : null,
                gender_filter: genderFilter ? genderFilter : null,
            };

            console.log('Sending PDF export payload:', payload);

            const response = await fetch(route('admin.reports.export-pdf'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const html = await response.text();
                const blob = new Blob([html], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `report_${reportType}_${new Date().getTime()}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setShowReportModal(false);
            } else {
                const contentType = response.headers.get('content-type');
                let errorMsg = 'Error downloading report';
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    errorMsg = data.errors ? Object.values(data.errors).flat().join(', ') : (data.message || errorMsg);
                }
                alert('Error: ' + errorMsg);
                console.error('PDF export error, status:', response.status);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error downloading report: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setReportLoading(false);
        }
    };

    const isReportTypeSelected = reportType !== null;
    const isReportDataValid = reportType === 'overall' ||
        (reportType === 'monthly' && reportMonth) ||
        (reportType === 'custom' && reportStartDate && reportEndDate);

    // Show report viewer if a report is selected
    if (selectedReport) {
        return (
            <>
                <Head title="Manage Users - Admin Panel" />
                <div className="min-h-screen bg-gray-100">
                    <div className="print:hidden">
                        <AdminNavigation auth={auth} themeColor="#FF8A34" />
                    </div>
                    <ReportViewer
                        reportType={selectedReport}
                        onBack={() => setSelectedReport(null)}
                    />
                </div>
            </>
        );
    }

    // Show print report if requested
    if (showPrintReport) {
        return (
            <>
                <Head title="User Report - Admin Panel" />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="print:hidden">
                        <AdminNavigation auth={auth} themeColor="#FF8A34" />
                    </div>

                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
                        {/* Report Header - Hidden on Print */}
                        <div className="print:hidden mb-6 sm:mb-8">
                            <button
                                onClick={() => setShowPrintReport(false)}
                                className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                ← Back to User Management
                            </button>
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                    User Report
                                </h1>

                                {/* Report Filters */}
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                                    {/* Gender Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Gender:
                                        </label>
                                        <select value={reportUserType} onChange={(e) => setReportUserType(e.target.value as 'all' | 'male' | 'female')} className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                                            <option value="all">All</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                                    {/* Year Level Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Year Level:
                                        </label>
                                        <select value={reportAgeRange} onChange={(e) => setReportAgeRange(e.target.value as 'all' | 'year1' | 'year2' | 'year3' | 'year4' | 'year5' | 'year6')} className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                                            <option value="all">All Years</option>
                                            <option value="year1">Year 1 (7 years)</option>
                                            <option value="year2">Year 2 (8 years)</option>
                                            <option value="year3">Year 3 (9 years)</option>
                                            <option value="year4">Year 4 (10 years)</option>
                                            <option value="year5">Year 5 (11 years)</option>
                                            <option value="year6">Year 6 (12 years)</option>
                                        </select>
                                    </div>

                                    {/* Period Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Period:
                                        </label>
                                        <select value={reportTimeRange} onChange={(e) => setReportTimeRange(e.target.value as 'today' | 'week' | 'month' | 'overall')} className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                                            <option value="overall">Overall</option>
                                            <option value="today">Today</option>
                                            <option value="week">This Week</option>
                                            <option value="month">This Month</option>
                                        </select>
                                    </div>

                                    {/* Print Button */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={() => window.print()}
                                            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-xs sm:text-sm font-medium"
                                        >
                                            🖨️ Print Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Content */}
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
                                User Report
                            </h2>

                            {/* Period Section */}
                            <div className="mb-8">
                                <p className="text-lg font-semibold text-gray-800 mb-2">
                                    Period: <span className="text-lg font-semibold text-gray-800">{getFormattedPeriod()}</span>
                                </p>
                            </div>

                            {/* Total Users Section */}
                            <div className="mb-8">
                                <p className="text-lg font-semibold text-gray-800 mb-4">
                                    Total Users: <span className="text-lg font-semibold text-gray-800">{reportTotals.total}</span>
                                </p>

                                {/* Gender Breakdown Table */}
                                <table className="border-collapse">
                                    <tbody>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800">
                                                Male
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-600">{reportTotals.male}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800">
                                                Female
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-600">{reportTotals.female}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Gender by Year Level Chart */}
                            <div className="mt-10 mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Gender Distribution by Year Level
                                </h3>
                                <div className="w-full h-96 bg-gray-50 rounded-lg p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fill: '#4B5563', fontSize: 12 }}
                                                axisLine={{ stroke: '#D1D5DB' }}
                                            />
                                            <YAxis
                                                tick={{ fill: '#4B5563', fontSize: 12 }}
                                                axisLine={{ stroke: '#D1D5DB' }}
                                                label={{ value: 'Number of Students', angle: -90, position: 'insideLeft', dy: 105 }}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #D1D5DB' }}
                                                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                            />
                                            <Legend />
                                            <Bar dataKey="Male" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                                            <Bar dataKey="Female" fill="#EC4899" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="mt-10">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 print:text-sm">
                                    User Details:
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse text-xs print:text-[10px]">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-left font-medium text-gray-800 print:font-semibold">
                                                    ID
                                                </th>
                                                <th className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-left font-medium text-gray-800 print:font-semibold">
                                                    Name
                                                </th>
                                                <th className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-left font-medium text-gray-800 print:font-semibold">
                                                    Email
                                                </th>
                                                <th className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-left font-medium text-gray-800 print:font-semibold">
                                                    Age
                                                </th>
                                                <th className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-left font-medium text-gray-800 print:font-semibold">
                                                    Gender
                                                </th>
                                                <th className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-left font-medium text-gray-800 print:font-semibold">
                                                    Guardian
                                                </th>
                                                <th className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-left font-medium text-gray-800 print:font-semibold">
                                                    Phone
                                                </th>
                                                <th className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-left font-medium text-gray-800 print:font-semibold">
                                                    G. Email
                                                </th>
                                                <th className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-left font-medium text-gray-800 print:font-semibold">
                                                    Registered
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportFilteredUsers.map((user, idx) => (
                                                <tr key={user.id}>
                                                    <td className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-gray-600 print:text-[9px]">{user.user_id}</td>
                                                    <td className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-gray-600 print:text-[9px]">{user.name}</td>
                                                    <td className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-gray-600 print:text-[9px] truncate">{user.email}</td>
                                                    <td className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-gray-600 print:text-[9px]">{user.age ? `${user.age}` : '—'}</td>
                                                    <td className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-gray-600 print:text-[9px]">{user.gender || '—'}</td>
                                                    <td className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-gray-600 print:text-[9px] truncate">{user.guardian_fullname || '—'}</td>
                                                    <td className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-gray-600 print:text-[9px] truncate">{user.guardian_phone || '—'}</td>
                                                    <td className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-gray-600 print:text-[9px] truncate">{user.guardian_email || '—'}</td>
                                                    <td className="border border-gray-300 px-1 print:px-0.5 py-1 print:py-0.5 text-gray-600 print:text-[9px]">{user.date_registered}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {reportFilteredUsers.length === 0 && (
                                    <p className="text-center py-6 text-gray-600">
                                        No users found matching the selected filters
                                    </p>
                                )}
                            </div>

                            {/* Footer - Hidden on Print */}
                            <div className="print:hidden mt-6 pt-6 border-t">
                                <p className="text-xs text-gray-600">Report generated on {new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Main Admin Panel */}
            <Head title="User - TanganakDusun" />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <AdminNavigation auth={auth} themeColor="#FF8A34" />

                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Page Heading */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3">
                            <UsersIcon className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-orange-600" />
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                                User Management
                            </h1>
                        </div>
                        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                            Browse, search, and manage user accounts across your platform
                        </p>
                    </div>

                    <div className="flex flex-col-reverse lg:flex-row lg:items-start gap-5">
                        {/* Main Content */}
                        <div className="flex-1 min-w-0 flex flex-col gap-5">
                    {/* User Overview Card */}
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-t-4 border-orange-500">
                        <div className="flex items-center gap-2 mb-4 sm:mb-6">
                            <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                User Overview
                            </h2>
                        </div>

                        {/* Filters - in same row */}
                        <div className="mb-4 sm:mb-6">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Filters:
                            </label>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                            {/* Gender Filter */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Gender:
                                </label>
                                <select
                                    value={userType}
                                    onChange={(e) => setUserType(e.target.value as 'all' | 'male' | 'female')}
                                    className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="all">All</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            {/* Year Level Filter */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Year Level:
                                </label>
                                <select
                                    value={ageRange}
                                    onChange={(e) => setAgeRange(e.target.value as 'all' | 'year1' | 'year2' | 'year3' | 'year4' | 'year5' | 'year6')}
                                    className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="all">All Years</option>
                                    <option value="year1">Year 1 (7 years)</option>
                                    <option value="year2">Year 2 (8 years)</option>
                                    <option value="year3">Year 3 (9 years)</option>
                                    <option value="year4">Year 4 (10 years)</option>
                                    <option value="year5">Year 5 (11 years)</option>
                                    <option value="year6">Year 6 (12 years)</option>
                                </select>
                            </div>

                            {/* Period Filter */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Period:
                                </label>
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value as 'today' | 'week' | 'month' | 'overall')}
                                    className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="overall">Overall</option>
                                </select>
                            </div>
                            </div>
                        </div>

                        {/* Statistics Display - in same row */}
                        {analyticsLoading ? (
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                                <div className="animate-pulse h-28 bg-gray-200 rounded"></div>
                                <div className="animate-pulse h-28 bg-gray-200 rounded"></div>
                                <div className="animate-pulse h-28 bg-gray-200 rounded"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                                {/* Total Users Card */}
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 sm:p-4 border border-orange-200 flex flex-col justify-start min-h-28">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                                        Total Users
                                    </p>
                                    <p className="text-3xl sm:text-4xl font-bold text-orange-600">{totalUserCount}</p>
                                </div>

                                {/* Active This Week Card - Clickable */}
                                <button
                                    onClick={() => setShowNewUsersModal(true)}
                                    disabled={newUsers.length === 0}
                                    className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 sm:p-4 border border-orange-200 flex flex-col justify-start min-h-28 text-left disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-shadow disabled:hover:shadow-none"
                                >
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                                        New Users {newUsers.length > 0 && `(${newUsers.length})`}
                                    </p>
                                    <div className="space-y-1">
                                        {newUsers.length > 0 ? (
                                            <>
                                                {newUsers.slice(0, 2).map((user, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm">
                                                        <span className="text-orange-600 font-bold truncate">{user.name}</span>
                                                    </div>
                                                ))}
                                                {newUsers.length > 2 && (
                                                    <p className="text-xs text-orange-600 font-semibold">
                                                        +{newUsers.length - 2} more
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                No new users
                                            </p>
                                        )}
                                    </div>
                                </button>

                                {/* Registration Trend Card */}
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 sm:p-4 border border-orange-200 flex flex-col justify-start min-h-28">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                                        Gender Distribution
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700">Male</span>
                                            <span className="text-orange-600 font-bold">{filteredUsers.filter(u => u.gender === 'Male').length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700">Female</span>
                                            <span className="text-orange-600 font-bold">{filteredUsers.filter(u => u.gender === 'Female').length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search and Action Bar */}
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                            <div className="flex flex-row items-center gap-3 sm:gap-4">
                                {/* Search Bar */}
                                <form onSubmit={handleSearch} className="flex-1 min-w-0">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name or email..."
                                            className="w-full pl-10 pr-3 sm:pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </form>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                    <button
                                        onClick={handleDeleteClick}
                                        disabled={selectedUsers.length === 0}
                                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                                            selectedUsers.length > 0
                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <svg className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="hidden xs:inline">
                                            Delete ({selectedUsers.length})
                                        </span>
                                        <span className="xs:hidden">({selectedUsers.length})</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-12 sm:py-16">
                                <h3 className="text-base sm:text-lg font-medium text-gray-900">
                                    Not found
                                </h3>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                <div className="overflow-x-auto overflow-y-auto max-h-[500px] sm:max-h-[600px]">
                                    <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                                        <thead className="bg-orange-600 text-white sticky top-0">
                                            <tr>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-left whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                                        onChange={handleSelectAll}
                                                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3 sm:w-4 sm:h-4"
                                                    />
                                                </th>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-left font-semibold whitespace-nowrap">
                                                    ID
                                                </th>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-left font-semibold whitespace-nowrap">
                                                    Name
                                                </th>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-left font-semibold whitespace-nowrap">
                                                    Email
                                                </th>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-left font-semibold whitespace-nowrap">
                                                    Age
                                                </th>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-left font-semibold whitespace-nowrap">
                                                    Gender
                                                </th>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-left font-semibold whitespace-nowrap">
                                                    Guardian
                                                </th>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-left font-semibold whitespace-nowrap">
                                                    Phone
                                                </th>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-left font-semibold whitespace-nowrap">
                                                    Guardian Email
                                                </th>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-left font-semibold whitespace-nowrap">
                                                    Registered
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredUsers.map((user, idx) => (
                                                <tr
                                                    key={user.id}
                                                    className={`${
                                                        idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                                    } hover:bg-orange-50 transition`}
                                                >
                                                    <td className="px-1 sm:px-2 py-1 sm:py-2 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedUsers.includes(user.id)}
                                                            onChange={() => handleSelectUser(user.id)}
                                                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3 sm:w-4 sm:h-4"
                                                        />
                                                    </td>
                                                    <td className="px-1 sm:px-2 py-1 sm:py-2 text-gray-900 font-mono whitespace-nowrap text-xs sm:text-sm">{user.user_id}</td>
                                                    <td className="px-1 sm:px-2 py-1 sm:py-2 font-medium text-gray-900 whitespace-nowrap">{user.name}</td>
                                                    <td className="px-1 sm:px-2 py-1 sm:py-2 text-gray-600 whitespace-nowrap text-xs sm:text-sm">{user.email}</td>
                                                    <td className="px-1 sm:px-2 py-1 sm:py-2 text-gray-600 whitespace-nowrap">
                                                        {user.age ? `${user.age}y` : '—'}
                                                    </td>
                                                    <td className="px-1 sm:px-2 py-1 sm:py-2 text-gray-600 whitespace-nowrap">
                                                        {user.gender ? (
                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                                                user.gender === 'Male'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : user.gender === 'Female'
                                                                    ? 'bg-pink-100 text-pink-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {user.gender}
                                                            </span>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>
                                                    <td className="px-1 sm:px-2 py-1 sm:py-2 text-gray-600 whitespace-nowrap text-xs sm:text-sm">
                                                        {user.guardian_fullname || '—'}
                                                    </td>
                                                    <td className="px-1 sm:px-2 py-1 sm:py-2 text-gray-600 whitespace-nowrap text-xs sm:text-sm">
                                                        {user.guardian_phone || '—'}
                                                    </td>
                                                    <td className="px-1 sm:px-2 py-1 sm:py-2 text-gray-600 whitespace-nowrap text-xs sm:text-sm">
                                                        {user.guardian_email || '—'}
                                                    </td>
                                                    <td className="px-1 sm:px-2 py-1 sm:py-2 text-gray-600 whitespace-nowrap text-xs sm:text-sm">{user.date_registered}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                        {/* About & Tips Sidebar */}
                        <div className="w-full lg:w-72 lg:sticky lg:top-8 h-fit flex-shrink-0">
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-4 sm:p-6 border border-orange-200">
                                <div className="space-y-4">
                                    {/* About Section */}
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                                            About
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                            Manage all user accounts on your platform. View user profiles, track registration information, guardian details, and generate detailed reports. Perform bulk actions and maintain complete oversight of your learner community.
                                        </p>
                                    </div>

                                    {/* Tips Section */}
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                                            Tips
                                        </h3>
                                        <ul className="text-xs sm:text-sm text-gray-700 space-y-1 sm:space-y-2 list-disc list-inside">
                                            <li>Use Overview card to track user stats</li>
                                            <li>Filter total users by gender</li>
                                            <li>Monitor new registrations by time period</li>
                                            <li>Search and select users for bulk deletion</li>
                                            <li>View complete user details in table rows</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* View Report Card */}
                            <button
                                onClick={() => setShowPrintReport(true)}
                                className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 text-left border border-gray-200 mt-3"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <Printer className="h-10 w-10 text-orange-600" />
                                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                                        Print Report
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    View & Print User Report
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Filter and print a detailed report of all users with full details
                                </p>
                                <div className="flex items-center text-orange-600 font-medium text-sm hover:text-orange-700">
                                    View Report →
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center justify-center h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-red-100 mx-auto mb-3 sm:mb-4">
                                <svg className="h-5 sm:h-6 w-5 sm:w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 text-center">
                                Delete User(s)
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center">
                                Are you sure you want to delete {selectedUsers.length} user(s)? This action cannot be undone.
                            </p>
                        </div>

                        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end border-t">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Users Modal */}
            {showNewUsersModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                New Users
                            </h3>
                            <button
                                onClick={() => setShowNewUsersModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 sm:p-6">
                            {newUsers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm sm:text-base">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-gray-900">
                                                    Name
                                                </th>
                                                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-gray-900">
                                                    Registration Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {newUsers.map((user, idx) => (
                                                <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                                    <td className="py-3 px-3 sm:px-4 text-gray-900 font-medium">{user.name}</td>
                                                    <td className="py-3 px-3 sm:px-4 text-gray-600">{user.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center text-gray-600 py-6">
                                    No new users found
                                </p>
                            )}
                        </div>

                        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t flex justify-end">
                            <button
                                onClick={() => setShowNewUsersModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
