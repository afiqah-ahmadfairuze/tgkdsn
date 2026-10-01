import { Head, router } from '@inertiajs/react';
import { useState, useEffect, FormEventHandler } from 'react';
import AdminNavigation from '@/Components/AdminNavigation';
import ReportViewer from '@/Components/ReportViewer';
import axios from 'axios';
import { Trophy, Plus, Trash2, Printer } from 'lucide-react';

interface LeaderboardEntry {
    rank: number;
    id: number;
    user_id: string;
    name: string;
    email: string;
    total_marks: number;
    total_quizzes: number;
    age?: number;
    gender?: string;
}

interface StreakTrackerEntry {
    user_id: string;
    name: string;
    current_streak: number;
    total_marks: number;
    total_quizzes: number;
    age?: number;
    gender?: string;
}

interface LeaderboardProps {
    leaderboard: LeaderboardEntry[];
    search: string;
    filter: string;
    streakTracker: StreakTrackerEntry[];
}

// Rank badge styling
const getRankBadgeColor = (rank: number): string => {
    switch (rank) {
        case 1:
            return 'bg-yellow-100 text-yellow-800'; // Gold
        case 2:
            return 'bg-gray-100 text-gray-800'; // Silver
        case 3:
            return 'bg-orange-100 text-orange-800'; // Bronze
        default:
            return 'bg-gray-50 text-gray-600';
    }
};

export default function Leaderboard({ leaderboard, search: initialSearch, filter: initialFilter, streakTracker }: LeaderboardProps) {
    const [searchQuery, setSearchQuery] = useState(initialSearch || '');
    const [filter, setFilter] = useState(initialFilter || 'overall');
    const [showBonusModal, setShowBonusModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [bonusForm, setBonusForm] = useState({ points: '', reason: '' });
    const [bonusLoading, setBonusLoading] = useState(false);
    const [notification, setNotification] = useState<{type: 'success' | 'error' | null; message: string}>({ type: null, message: '' });

    // Overview filters
    const [overviewAgeFilter, setOverviewAgeFilter] = useState('all');
    const [overviewGenderFilter, setOverviewGenderFilter] = useState('all');

    // Print Report state
    const [showPrintReport, setShowPrintReport] = useState(false);
    const [reportAgeFilter, setReportAgeFilter] = useState<'all' | 'year1' | 'year2' | 'year3' | 'year4' | 'year5' | 'year6'>('all');
    const [reportGenderFilter, setReportGenderFilter] = useState<'all' | 'male' | 'female'>('all');
    const [reportTimeRange, setReportTimeRange] = useState<'today' | 'week' | 'month' | 'overall'>('overall');

    // Report state
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    // Bonus Details History state
    const [showBonusHistory, setShowBonusHistory] = useState(false);
    const [bonusHistory, setBonusHistory] = useState<any[]>([]);
    const [bonusHistoryLoading, setBonusHistoryLoading] = useState(false);

    // Fetch bonus history on component mount
    useEffect(() => {
        fetchBonusHistory();
    }, []);

    const fetchBonusHistory = async () => {
        try {
            setBonusHistoryLoading(true);
            const response = await axios.get(route('admin.leaderboard.bonus-history'));
            if (response.data.success) {
                setBonusHistory(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching bonus history:', error);
        } finally {
            setBonusHistoryLoading(false);
        }
    };

    // Handle checkbox selection
    const handleSelectItem = (userId: number) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    // Handle select all checkbox
    const handleSelectAllItems = () => {
        if (selectedUsers.length === filteredLeaderboard.length && filteredLeaderboard.length > 0) {
            // Deselect all
            setSelectedUsers([]);
        } else {
            // Select all
            setSelectedUsers(filteredLeaderboard.map(entry => entry.id));
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.leaderboard.index'), { search: searchQuery, filter });
    };

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        router.get(route('admin.leaderboard.index'), { search: searchQuery, filter: newFilter });
    };

    const handleRefresh = async () => {
        try {
            const response = await axios.post(route('admin.leaderboard.refresh'));

            if (response.data.success) {
                alert(response.data.message || 'Leaderboard refreshed successfully!');
                router.visit(route('admin.leaderboard.index'));
            }
        } catch (error: any) {
            console.error('Error refreshing leaderboard:', error);
            alert('Error refreshing leaderboard. Please try again.');
        }
    };

    const openBonusModal = () => {
        if (selectedUsers.length === 0) {
            alert('Please select at least one user to award bonus points');
            return;
        }
        setBonusForm({ points: '', reason: '' });
        setShowBonusModal(true);
    };

    const handleAwardBonus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUsers.length === 0 || !bonusForm.points) return;

        setBonusLoading(true);

        try {
            // Award bonus to all selected users
            for (const userId of selectedUsers) {
                await axios.post('/admin/api/leaderboard/bonus-points', {
                    user_id: userId,
                    points: parseInt(bonusForm.points),
                    reason: bonusForm.reason,
                });
            }

            setNotification({
                type: 'success',
                message: `Bonus points (${bonusForm.points}) awarded to ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} successfully`
            });
            setShowBonusModal(false);
            setBonusForm({ points: '', reason: '' });
            setSelectedUsers([]);

            // Refresh leaderboard to show updated points
            setTimeout(() => {
                router.visit(route('admin.leaderboard.index'));
            }, 1000);
        } catch (error: any) {
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Error awarding bonus points'
            });
        } finally {
            setBonusLoading(false);
        }
    };

    // Helper function to check if entry matches age and gender filters
    const matchesOverviewFilters = (age?: number, gender?: string): boolean => {
        // Check age filter
        if (overviewAgeFilter !== 'all' && age !== undefined) {
            const ageMatches = {
                'under7': age < 7,
                '7to9': age >= 7 && age <= 9,
                '10to12': age >= 10 && age <= 12,
                'over12': age > 12,
            }[overviewAgeFilter] ?? true;
            if (!ageMatches) return false;
        }

        // Check gender filter
        if (overviewGenderFilter !== 'all' && gender !== undefined) {
            const genderMatches = {
                'male': gender.toLowerCase() === 'male',
                'female': gender.toLowerCase() === 'female',
            }[overviewGenderFilter] ?? true;
            if (!genderMatches) return false;
        }

        return true;
    };

    const filteredLeaderboard = leaderboard.filter((entry) => {
        // Apply search filter
        const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.user_id.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch && matchesOverviewFilters(entry.age, entry.gender);
    });

    // Get top 3 users (filtered)
    const getTop3Users = () => {
        const filtered = leaderboard.filter((entry) => matchesOverviewFilters(entry.age, entry.gender));
        return filtered.slice(0, 3);
    };

    // Get highest streak users (filtered)
    const getHighestStreakUsers = () => {
        const filtered = streakTracker.filter((entry) => matchesOverviewFilters(entry.age, entry.gender));
        const sorted = [...filtered].sort((a, b) => b.current_streak - a.current_streak);
        return sorted.slice(0, 3);
    };

    // Get highest marks users (filtered)
    const getHighestMarksUsers = () => {
        const filtered = leaderboard.filter((entry) => matchesOverviewFilters(entry.age, entry.gender));
        const sorted = [...filtered].sort((a, b) => b.total_marks - a.total_marks);
        return sorted.slice(0, 3);
    };

    // Helper to filter report leaderboard by age, gender, and time range
    const getReportFilteredLeaderboard = () => {
        return leaderboard.filter((entry) => {
            // Apply age filter
            if (reportAgeFilter !== 'all' && entry.age !== undefined) {
                const ageMatches = {
                    'year1': entry.age === 7,
                    'year2': entry.age === 8,
                    'year3': entry.age === 9,
                    'year4': entry.age === 10,
                    'year5': entry.age === 11,
                    'year6': entry.age === 12,
                }[reportAgeFilter] ?? true;
                if (!ageMatches) return false;
            }

            // Apply gender filter
            if (reportGenderFilter !== 'all' && entry.gender !== undefined) {
                const genderMatches = {
                    'male': entry.gender.toLowerCase() === 'male',
                    'female': entry.gender.toLowerCase() === 'female',
                }[reportGenderFilter] ?? true;
                if (!genderMatches) return false;
            }

            return true;
        });
    };

    const reportFilteredLeaderboard = getReportFilteredLeaderboard();

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

    // Get top 3 for report
    const getReportTop3 = () => reportFilteredLeaderboard.slice(0, 3);

    // Get highest marks for report
    const getReportHighestMarks = () => {
        const sorted = [...reportFilteredLeaderboard].sort((a, b) => b.total_marks - a.total_marks);
        return sorted[0];
    };

    // Get highest streak for report
    const getReportHighestStreak = () => {
        const filtered = streakTracker.filter((entry) => {
            if (reportAgeFilter !== 'all' && entry.age !== undefined) {
                const ageMatches = {
                    'year1': entry.age === 7,
                    'year2': entry.age === 8,
                    'year3': entry.age === 9,
                    'year4': entry.age === 10,
                    'year5': entry.age === 11,
                    'year6': entry.age === 12,
                }[reportAgeFilter] ?? true;
                if (!ageMatches) return false;
            }
            if (reportGenderFilter !== 'all' && entry.gender !== undefined) {
                const genderMatches = {
                    'male': entry.gender.toLowerCase() === 'male',
                    'female': entry.gender.toLowerCase() === 'female',
                }[reportGenderFilter] ?? true;
                if (!genderMatches) return false;
            }
            return true;
        });
        const sorted = [...filtered].sort((a, b) => b.current_streak - a.current_streak);
        return sorted[0];
    };

    // Show print report if requested
    if (showPrintReport) {
        return (
            <>
                <Head title="Leaderboard Report - Admin Panel" />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="print:hidden">
                        <AdminNavigation themeColor="#4DA6FF" />
                    </div>

                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
                        {/* Report Header - Hidden on Print */}
                        <div className="print:hidden mb-6 sm:mb-8">
                            <button
                                onClick={() => setShowPrintReport(false)}
                                className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                ← Back to Leaderboard
                            </button>
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                    Leaderboard Report
                                </h1>

                                {/* Report Filters */}
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                                    {/* Age Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Age (Year Level):
                                        </label>
                                        <select value={reportAgeFilter} onChange={(e) => setReportAgeFilter(e.target.value as 'all' | 'year1' | 'year2' | 'year3' | 'year4' | 'year5' | 'year6')} className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                                            <option value="all">All Years</option>
                                            <option value="year1">Year 1 (7 years)</option>
                                            <option value="year2">Year 2 (8 years)</option>
                                            <option value="year3">Year 3 (9 years)</option>
                                            <option value="year4">Year 4 (10 years)</option>
                                            <option value="year5">Year 5 (11 years)</option>
                                            <option value="year6">Year 6 (12 years)</option>
                                        </select>
                                    </div>

                                    {/* Gender Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Gender:
                                        </label>
                                        <select value={reportGenderFilter} onChange={(e) => setReportGenderFilter(e.target.value as 'all' | 'male' | 'female')} className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                                            <option value="all">All</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                                    {/* Period Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Period:
                                        </label>
                                        <select value={reportTimeRange} onChange={(e) => setReportTimeRange(e.target.value as 'today' | 'week' | 'month' | 'overall')} className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
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
                                            className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition text-xs sm:text-sm font-medium"
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
                                Leaderboard Report
                            </h2>

                            {/* Period Section */}
                            <div className="mb-8">
                                <p className="text-lg font-semibold text-gray-800 mb-2">
                                    Period: <span className="text-lg font-semibold text-gray-800">{getFormattedPeriod()}</span>
                                </p>
                            </div>

                            {/* Top 3 Rank Table */}
                            <div className="mb-10">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Top 3 Rank
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse text-xs sm:text-sm">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                    Rank
                                                </th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                    User Name
                                                </th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                    Total Quiz Attempted
                                                </th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                    Total Marks Collected
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getReportTop3().map((entry, idx) => (
                                                <tr key={entry.id}>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{entry.rank}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{entry.name}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{entry.total_quizzes}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600 font-medium">{entry.total_marks}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Highest Marks Section */}
                            <div className="mb-8">
                                <p className="text-lg font-semibold text-gray-800">
                                    Highest Marks: <span className="text-gray-600">{getReportHighestMarks()?.name || 'N/A'} ({getReportHighestMarks()?.total_marks || 0})</span>
                                </p>
                            </div>

                            {/* Highest Streak Section */}
                            <div className="mb-10">
                                <p className="text-lg font-semibold text-gray-800">
                                    Highest Streak: <span className="text-gray-600">{getReportHighestStreak()?.name || 'N/A'} ({getReportHighestStreak()?.current_streak || 0})</span>
                                </p>
                            </div>

                            {/* Leaderboard Overall Details Table */}
                            <div className="mt-10">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Leaderboard Overall Details
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse text-xs sm:text-sm">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                    Rank
                                                </th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                    Name
                                                </th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                    Total Marks
                                                </th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                    Current Streak
                                                </th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                    Quizzes
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportFilteredLeaderboard.map((entry) => (
                                                <tr key={entry.id}>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{entry.rank}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{entry.name}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{entry.total_marks}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">
                                                        {streakTracker.find(s => s.name === entry.name)?.current_streak || 0}
                                                    </td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{entry.total_quizzes}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {reportFilteredLeaderboard.length === 0 && (
                                    <p className="text-center py-6 text-gray-600">
                                        Not found
                                    </p>
                                )}
                            </div>

                            {/* Footer - Hidden on Print */}
                            <div className="print:hidden mt-6 pt-6 border-t">
                                <p className="text-xs text-gray-600">
                                    Report generated on {new Date().toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show report viewer if a report is selected
    if (selectedReport) {
        return (
            <>
                <Head title="Leaderboard - Admin Panel" />
                <div className="min-h-screen bg-gray-100">
                    <div className="print:hidden">
                        <AdminNavigation themeColor="#4DA6FF" />
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
            <Head title="Leaderboard - TanganakDusun" />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <AdminNavigation themeColor="#4DA6FF" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Notification */}
                    {notification.type && (
                        <div className={`mb-4 p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {notification.message}
                        </div>
                    )}

                    {/* Page Heading */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3">
                            <Trophy className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-sky-600" />
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                                Leaderboard
                            </h1>
                        </div>
                        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                            Track user rankings and recognize top performers
                        </p>
                    </div>

                    <div className="flex flex-col-reverse lg:flex-row lg:items-start gap-5">
                        {/* Main Content */}
                        <div className="flex-1 min-w-0 flex flex-col gap-5">
                            {/* Leaderboard Overview Card */}
                            <div>
                                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-t-4 border-sky-500">
                                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                        <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                            Leaderboard Overview
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                                Age:
                                            </label>
                                            <select
                                                value={overviewAgeFilter}
                                                onChange={(e) => setOverviewAgeFilter(e.target.value)}
                                                className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                            >
                                                <option value="all">All Ages</option>
                                                <option value="under7">Under 7</option>
                                                <option value="7to9">7-9 Years</option>
                                                <option value="10to12">10-12 Years</option>
                                                <option value="over12">Over 12</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                                Gender:
                                            </label>
                                            <select
                                                value={overviewGenderFilter}
                                                onChange={(e) => setOverviewGenderFilter(e.target.value)}
                                                className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                            >
                                                <option value="all">All Genders</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                                Period:
                                            </label>
                                            <select
                                                value={filter}
                                                onChange={(e) => handleFilterChange(e.target.value)}
                                                className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                            >
                                                <option value="overall">Overall</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="weekly">Weekly</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                                        {/* Top 3 Rank Card */}
                                        <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-3 sm:p-4 border border-sky-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                                                Top 3 Rank
                                            </p>
                                            <div className="space-y-2">
                                                {getTop3Users().slice(0, 3).map((entry, idx) => (
                                                    <div key={entry.id} className="flex items-center gap-2 text-sm sm:text-lg">
                                                        <span className="font-bold text-sky-600">#{idx + 1}</span>
                                                        <span className="text-sky-600 font-bold truncate">{entry.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Highest Streak Card */}
                                        <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-3 sm:p-4 border border-sky-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                                                Highest Streak
                                            </p>
                                            <div className="space-y-2">
                                                {getHighestStreakUsers().slice(0, 3).map((entry, idx) => (
                                                    <div key={entry.user_id} className="flex items-center justify-between text-sm sm:text-lg">
                                                        <span className="text-sky-600 font-bold truncate">{entry.name}</span>
                                                        <span className="text-sky-600 font-bold flex-shrink-0 ml-2 text-lg sm:text-xl">{entry.current_streak}d</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Highest Marks Card */}
                                        <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-3 sm:p-4 border border-sky-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                                                Highest Marks
                                            </p>
                                            <div className="space-y-2">
                                                {getHighestMarksUsers().slice(0, 3).map((entry, idx) => (
                                                    <div key={entry.id} className="flex items-center justify-between text-sm sm:text-lg">
                                                        <span className="text-sky-600 font-bold truncate">{entry.name}</span>
                                                        <span className="text-sky-600 font-bold flex-shrink-0 ml-2 text-lg sm:text-xl">{entry.total_marks}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search Bar, Award Bonus and Refresh */}
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
                                                placeholder="Search by name, email or user ID..."
                                                className="w-full pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                                            />
                                        </div>
                                    </form>

                                    {/* Award Bonus Button */}
                                    <button
                                        onClick={openBonusModal}
                                        disabled={selectedUsers.length === 0}
                                        className={`px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                                            selectedUsers.length > 0
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Award Bonus
                                    </button>

                                    {/* Refresh Button */}
                                    <button
                                        onClick={handleRefresh}
                                        className="px-3 sm:px-4 py-2 bg-sky-600 text-white rounded-lg font-medium transition hover:bg-sky-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
                                    >
                                        <svg className="w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span className="hidden sm:inline">Refresh</span>
                                    </button>
                                </div>
                            </div>

                            {/* Leaderboard Table */}
                            {filteredLeaderboard.length === 0 ? (
                                <div className="text-center py-12 sm:py-16">
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900">
                                        Not found
                                    </h3>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                    <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[600px]">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-sky-600 text-white sticky top-0">
                                                <tr>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300"
                                                            checked={selectedUsers.length === filteredLeaderboard.length && filteredLeaderboard.length > 0}
                                                            ref={el => {
                                                                if (el) {
                                                                    el.indeterminate = selectedUsers.length > 0 && selectedUsers.length < filteredLeaderboard.length;
                                                                }
                                                            }}
                                                            onChange={handleSelectAllItems}
                                                        />
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        Rank
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        Name
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        User ID
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        Total Marks
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        Current Streak
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        Quizzes
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredLeaderboard.map((entry) => {
                                                    // Find streak data for this user
                                                    const streakData = streakTracker.find(s => s.user_id === entry.user_id);
                                                    return (
                                                        <tr key={entry.id} className="hover:bg-gray-50 transition">
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedUsers.includes(entry.id)}
                                                                    onChange={() => handleSelectItem(entry.id)}
                                                                    className="rounded border-gray-300"
                                                                />
                                                            </td>
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                                                                <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${getRankBadgeColor(entry.rank)}`}>
                                                                    #{entry.rank}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap max-w-xs truncate">
                                                                {entry.name}
                                                            </td>
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                                {entry.user_id}
                                                            </td>
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 font-semibold">
                                                                {entry.total_marks}
                                                            </td>
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                                                                {streakData ? (
                                                                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-sky-100 text-sky-800">
                                                                        {streakData.current_streak} days
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs sm:text-sm text-gray-500">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600">
                                                                {entry.total_quizzes}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* About & Tips Sidebar */}
                        <div className="w-full lg:w-72 lg:sticky lg:top-8 h-fit flex-shrink-0">
                            <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg shadow-md p-4 sm:p-6 border border-sky-100">
                                <div className="space-y-4">
                                    {/* About Section */}
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                                            About
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                            Track learner progress and recognize achievements through competitive rankings. Monitor overall, monthly, and weekly performance, award bonus points to top performers, and use gamification to motivate continued engagement and learning consistency.
                                        </p>
                                    </div>

                                    {/* Tips Section */}
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                                            Tips
                                        </h3>
                                        <ul className="text-xs sm:text-sm text-gray-700 space-y-1 sm:space-y-2 list-disc list-inside">
                                            <li>Filter by Overall, Monthly, or Weekly rankings</li>
                                            <li>Award bonus points to recognize top performers</li>
                                            <li>Monitor streak data for user consistency</li>
                                            <li>Use rankings to motivate engagement</li>
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
                                    <Printer className="h-10 w-10 text-sky-600" />
                                    <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
                                        Print Report
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    View & Print Leaderboard Report
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Filter and print detailed leaderboard rankings with top performers and achievements
                                </p>
                                <div className="flex items-center text-sky-600 font-medium text-sm hover:text-sky-600-dark">
                                    View Report →
                                </div>
                            </button>

                            {/* Bonus Details History Card */}
                            <button
                                onClick={() => setShowBonusHistory(true)}
                                className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 text-left border border-gray-200 mt-3"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-4xl">⭐</div>
                                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                                        History
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    Bonus Details History
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    View complete history of bonus points awarded to users
                                </p>
                                <div className="flex items-center text-amber-600 font-medium text-sm hover:text-amber-600-dark">
                                    View History →
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bonus Points Modal */}
            {showBonusModal && selectedUsers.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                Award Bonus Points
                            </h2>
                            <button
                                onClick={() => setShowBonusModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAwardBonus} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Selected Users ({selectedUsers.length})
                                </label>
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                    {filteredLeaderboard
                                        .filter(entry => selectedUsers.includes(entry.id))
                                        .map(entry => (
                                            <div key={entry.id} className="px-3 py-2 bg-sky-50 rounded border border-sky-200 text-sm text-gray-900">
                                                {entry.name} ({entry.user_id})
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bonus Points (Same for all) *
                                </label>
                                <input
                                    type="number"
                                    value={bonusForm.points}
                                    onChange={(e) => setBonusForm({ ...bonusForm, points: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    placeholder="Enter number of points"
                                    min="1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason
                                </label>
                                <textarea
                                    value={bonusForm.reason}
                                    onChange={(e) => setBonusForm({ ...bonusForm, reason: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    placeholder="Optional reason for bonus points"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowBonusModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bonusLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md transition disabled:opacity-50 hover:bg-sky-700"
                                >
                                    {bonusLoading ? 'Awarding...' : 'Award Bonus'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bonus Details History Modal */}
            {showBonusHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Bonus Details History
                            </h2>
                            <button
                                onClick={() => setShowBonusHistory(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {bonusHistoryLoading ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">
                                        Loading bonus history...
                                    </p>
                                </div>
                            ) : bonusHistory.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">
                                        No bonus history found
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-900">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-900">
                                                    User ID
                                                </th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-900">
                                                    Bonus Points Added
                                                </th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-900">
                                                    Reason
                                                </th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-900">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bonusHistory.map((bonus, idx) => (
                                                <tr key={bonus.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                                    <td className="px-4 py-3 text-gray-900 font-medium">{bonus.name}</td>
                                                    <td className="px-4 py-3 text-gray-700">{bonus.user_id}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">
                                                            +{bonus.bonus_points}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700">{bonus.reason || '-'}</td>
                                                    <td className="px-4 py-3 text-gray-600 text-xs">{bonus.created_at}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
                            <button
                                onClick={() => setShowBonusHistory(false)}
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
