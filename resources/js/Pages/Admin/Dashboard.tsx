import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AdminNavigation from '@/Components/AdminNavigation';
import { Users, BookOpen, Book, Globe, MessageSquare, AlertCircle } from 'lucide-react';

interface DashboardStats {
    total_users: number;
    total_quizzes: number;
    total_learning_materials: number;
    dictionary_entries: number;
    total_feedback: number;
    total_issues: number;
}

interface AdminDashboardProps extends PageProps {
    dashboardStats: DashboardStats;
}

export default function AdminDashboard({ auth, dashboardStats }: AdminDashboardProps) {
    const cards = [
        {
            id: 'users',
            title: 'Total Users',
            count: dashboardStats.total_users,
            icon: Users,
            color: '#FF8A34',
            borderColor: 'border-orange-400',
            href: '/admin/users',
        },
        {
            id: 'quizzes',
            title: 'Total Quizzes',
            count: dashboardStats.total_quizzes,
            icon: BookOpen,
            color: '#FFD93D',
            borderColor: 'border-yellow-400',
            href: '/admin/quiz',
        },
        {
            id: 'materials',
            title: 'Total Materials',
            count: dashboardStats.total_learning_materials,
            icon: Book,
            color: '#4CD964',
            borderColor: 'border-green-400',
            href: '/admin/learning-materials',
        },
        {
            id: 'dictionary',
            title: 'Total Dictionary Words',
            count: dashboardStats.dictionary_entries,
            icon: Globe,
            color: '#4285F4',
            borderColor: 'border-blue-400',
            href: '/admin/dictionary',
        },
        {
            id: 'feedback',
            title: 'Total Feedbacks Received',
            count: dashboardStats.total_feedback,
            icon: MessageSquare,
            color: '#A66BFF',
            borderColor: 'border-purple-400',
            href: '/admin/feedback',
        },
        {
            id: 'issues',
            title: 'Total Issues Reported',
            count: dashboardStats.total_issues,
            icon: AlertCircle,
            color: '#FF4E4E',
            borderColor: 'border-red-400',
            href: '/admin/feedback',
        },
    ];

    return (
        <>
            <Head title="Dashboard - TanganakDusun" />

            <div className="min-h-screen bg-gray-100">
                {/* Admin Navigation */}
                <AdminNavigation auth={auth} themeColor="#FF4E4E" />

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Heading */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3">
                            <svg className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                                Dashboard
                            </h1>
                        </div>
                        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                            Welcome to the admin panel. Here's an overview of your platform's key metrics.
                        </p>
                    </div>

                    {/* Dashboard Cards Grid - 2 columns on mobile/tablet, 3 columns on desktop */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Link
                                    key={card.id}
                                    href={card.href}
                                    className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border-t-4 cursor-pointer ${card.borderColor}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm font-medium mb-2">{card.title}</p>
                                            <h2 className="text-4xl font-bold text-gray-900">{card.count.toLocaleString()}</h2>
                                        </div>
                                        <div
                                            className="p-3 rounded-lg flex-shrink-0"
                                            style={{ backgroundColor: card.color + '20' }}
                                        >
                                            <Icon
                                                className="w-8 h-8"
                                                style={{ color: card.color }}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Click to view details →
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
