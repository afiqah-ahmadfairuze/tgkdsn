import { useState, useEffect, useRef } from 'react';

interface ReportViewerProps {
    reportType: string;
    onBack: () => void;
}

interface ReportData {
    quizzes?: any[];
    stats?: any;
    users?: any[];
    total_feedback?: number;
    average_ratings?: any;
    leaderboard?: any[];
    total_entries?: number;
    completeness_stats?: any;
    [key: string]: any;
}

/*
 * Displays different types of admin reports with print support
 * Supports quiz, user, feedback, leaderboard, and dictionary reports
 */
export default function ReportViewer({ reportType, onBack }: ReportViewerProps) {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchReport();
    }, [reportType]);

    /* Fetches report data from the server based on report type */
    const fetchReport = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/admin/api/reports/${reportType}`);
            const data = await response.json();

            if (data.success) {
                setReportData(data.data);
            } else {
                setError(data.error || 'Failed to load report');
            }
        } catch (err) {
            setError('Error loading report');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    /* Opens browser print dialog for saving as PDF */
    const handlePrint = () => {
        window.print();
    };

    /* Returns the display title for each report type */
    const getReportTitle = () => {
        const titles: { [key: string]: string } = {
            quiz_performance: '📊 Quiz Performance Report',
            user_engagement: '👥 User Engagement Report',
            feedback_summary: '⭐ Feedback Summary Report',
            leaderboard_performance: '🏆 Leaderboard Performance Report',
            dictionary_coverage: '📚 Dictionary Coverage Report',
        };
        return titles[reportType] || 'Report';
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={onBack}
                    className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
                >
                    ← Back to Reports
                </button>
                <div className="flex justify-center items-center py-20">
                    <div className="text-gray-500 text-center">
                        <div className="mb-4">Loading report...</div>
                        <div className="inline-block animate-spin">⚙️</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={onBack}
                    className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
                >
                    ← Back to Reports
                </button>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Controls */}
            <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
                <button
                    onClick={onBack}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
                >
                    ← Back to Reports
                </button>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition flex items-center gap-2"
                >
                    🖨️ Print / Save as PDF
                </button>
            </div>

            {/* Print Container */}
            <div ref={printRef} className="bg-white rounded-lg shadow-md p-8 print:shadow-none print:rounded-none print:p-0">
                {/* Header */}
                <div className="mb-8 border-b-2 border-tgkdsn-yellow pb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{getReportTitle()}</h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Generated: {reportData?.generated_at}
                    </p>
                </div>

                {/* Report Content */}
                {reportData && reportType === 'quiz_performance' && <QuizPerformanceContent data={reportData} />}
                {reportData && reportType === 'user_engagement' && <UserEngagementContent data={reportData} />}
                {reportData && reportType === 'feedback_summary' && <FeedbackSummaryContent data={reportData} />}
                {reportData && reportType === 'leaderboard_performance' && <LeaderboardPerformanceContent data={reportData} />}
                {reportData && reportType === 'dictionary_coverage' && <DictionaryCoverageContent data={reportData} />}

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-gray-300 text-center text-xs text-gray-600 print:text-gray-500">
                    <p>This report was automatically generated by TanganakDusun Admin Panel</p>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    .print\\:hidden {
                        display: none;
                    }
                    .print\\:shadow-none {
                        box-shadow: none;
                    }
                    .print\\:rounded-none {
                        border-radius: 0;
                    }
                    .print\\:p-0 {
                        padding: 0;
                    }
                    .print\\:text-gray-500 {
                        color: rgb(107, 114, 128);
                    }
                    table {
                        page-break-inside: avoid;
                    }
                    tr {
                        page-break-inside: avoid;
                    }
                    h2 {
                        page-break-after: avoid;
                    }
                }
            `}</style>
        </div>
    );
}

/* Quiz Performance Report */
function QuizPerformanceContent({ data }: { data: ReportData }) {
    return (
        <>
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <StatBox label="Total Quizzes" value={data.stats?.total_quizzes || 0} />
                <StatBox label="Total Questions" value={data.stats?.total_questions || 0} />
                <StatBox label="Total Attempts" value={data.stats?.total_attempts || 0} />
                <StatBox label="Avg Score" value={data.stats?.average_attempt_score || 0} />
            </div>

            {/* Quiz Details Table */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Details</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Quiz ID</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Questions</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Marks</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Attempts</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Avg Score</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Pass Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data.quizzes?.map((quiz: any, idx: number) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-4 py-3 text-sm text-gray-900">{quiz.quiz_id}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{quiz.title}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{quiz.category}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{quiz.question_count}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{quiz.total_marks}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{quiz.total_attempts}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{quiz.average_score}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{quiz.pass_rate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

/* User Engagement Report */
function UserEngagementContent({ data }: { data: ReportData }) {
    return (
        <>
            <div className="grid grid-cols-3 gap-4 mb-8">
                <StatBox label="Total Users" value={data.total_users || 0} />
                <StatBox label="Active (30 days)" value={data.active_users_30days || 0} />
                <StatBox label="Inactive Users" value={data.inactive_users || 0} />
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Demographics */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Demographics</h2>
                    <table className="w-full divide-y divide-gray-200 border border-gray-200">
                        <tbody className="divide-y divide-gray-200">
                            <tr className="bg-blue-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">Male</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{data.demographics?.male}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">Female</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{data.demographics?.female}</td>
                            </tr>
                            <tr className="bg-blue-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">Other</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{data.demographics?.other}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Age Groups */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Age Groups</h2>
                    <table className="w-full divide-y divide-gray-200 border border-gray-200">
                        <tbody className="divide-y divide-gray-200">
                            <tr className="bg-blue-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">Under 10</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{data.age_groups?.under_10}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">10-15 years</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{data.age_groups?.['10_to_15']}</td>
                            </tr>
                            <tr className="bg-blue-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">16-20 years</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{data.age_groups?.['16_to_20']}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">Above 20</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{data.age_groups?.above_20}</td>
                            </tr>
                            <tr className="bg-yellow-50 font-bold">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">Average Age</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{data.average_age} years</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

/* Feedback Summary Report */
function FeedbackSummaryContent({ data }: { data: ReportData }) {
    return (
        <>
            <div className="grid grid-cols-4 gap-4 mb-8">
                <StatBox label="Ease of Use" value={data.average_ratings?.ease_of_use || 0} />
                <StatBox label="Learned Words" value={data.average_ratings?.learned_words || 0} />
                <StatBox label="Quiz Fun" value={data.average_ratings?.quiz_fun || 0} />
                <StatBox label="Virtual Tour" value={data.average_ratings?.virtual_tour || 0} />
            </div>

            {/* Feedback by Language */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Feedback by Language</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                        <thead className="bg-yellow-500 text-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Language</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {Object.entries(data.feedback_by_language || {}).map(([lang, count], idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-4 py-3 text-sm text-gray-900">{String(lang)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{String(count)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* All Feedback Details Table */}
            {data.all_feedback && data.all_feedback.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">All Feedback Details</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                            <thead className="bg-yellow-500 text-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Language</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">Ease of Use</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">Learned Words</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">Quiz Fun</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">Virtual Tour</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Favorite Part</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Improvements</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.all_feedback.map((feedback: any, idx: number) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{feedback.user_name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{feedback.language}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                                                {feedback.ease_of_use}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                                                {feedback.learned_words}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold">
                                                {feedback.quiz_fun}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-800 text-sm font-semibold">
                                                {feedback.virtual_tour}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title={feedback.favourite_part || '-'}>
                                            {feedback.favourite_part || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title={feedback.improvements || '-'}>
                                            {feedback.improvements || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{feedback.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}

/* Leaderboard Performance Report */
function LeaderboardPerformanceContent({ data }: { data: ReportData }) {
    return (
        <>
            <div className="grid grid-cols-4 gap-4 mb-8">
                <StatBox label="Total Users" value={data.total_users || 0} />
                <StatBox label="Highest Score" value={data.highest_score || 0} color="gold" />
                <StatBox label="Avg Score" value={data.average_score || 0} />
                <StatBox label="Total Awards" value={data.bonus_points_stats?.total_awards || 0} />
            </div>

            {/* Top Performers */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Top 10 Performers</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                        <thead className="bg-yellow-500 text-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Rank</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Score</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Marks</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Bonus</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Quizzes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data.top_performers?.map((user: any, idx: number) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-4 py-3 text-sm font-bold text-gray-900">#{user.rank}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{user.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{user.total_score}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{user.total_marks}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{user.bonus_points}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{user.quiz_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bonus Points Stats */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Bonus Points Statistics</h2>
                <table className="w-full divide-y divide-gray-200 border border-gray-200">
                    <tbody className="divide-y divide-gray-200">
                        <tr className="bg-yellow-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Total Awards Given</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{data.bonus_points_stats?.total_awards}</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Total Points Awarded</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{data.bonus_points_stats?.total_points_awarded}</td>
                        </tr>
                        <tr className="bg-yellow-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Admins Awarding Points</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{data.bonus_points_stats?.admins_awarding_points}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}

/* Dictionary Coverage Report */
function DictionaryCoverageContent({ data }: { data: ReportData }) {
    return (
        <>
            <div className="grid grid-cols-3 gap-4 mb-8">
                <ProgressStatBox
                    label="All Languages Complete"
                    value={data.completeness_stats?.all_languages || 0}
                />
                <ProgressStatBox
                    label="With Examples"
                    value={data.completeness_stats?.with_examples || 0}
                />
                <ProgressStatBox
                    label="With Pictures"
                    value={data.completeness_stats?.with_pictures || 0}
                />
            </div>

            {/* Language Coverage */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Language Coverage</h2>
                <table className="w-full divide-y divide-gray-200 border border-gray-200">
                    <tbody className="divide-y divide-gray-200">
                        <tr className="bg-blue-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Dusun Words</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{data.coverage_by_language?.dusun}</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">Bahasa Melayu Translations</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{data.coverage_by_language?.bm}</td>
                        </tr>
                        <tr className="bg-blue-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">English Translations</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{data.coverage_by_language?.english}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Incomplete Entries */}
            {data.incomplete_entries && data.incomplete_entries.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Sample Incomplete Entries</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Entry ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Dusun Word</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">BM Translation</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">EN Translation</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Has Picture</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.incomplete_entries.map((entry: any, idx: number) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="px-4 py-3 text-sm text-gray-900">{entry.entry_id}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{entry.dusun_word}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{entry.bm_translation}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{entry.en_translation}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{entry.has_picture ? '✓' : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recent Additions */}
            {data.recent_additions && data.recent_additions.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Additions</h2>
                    <table className="w-full divide-y divide-gray-200 border border-gray-200">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Word</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Added</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data.recent_additions.map((item: any, idx: number) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.dusun_word}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{item.created_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

/* Stat Box Component */
function StatBox({ label, value, color = 'blue' }: { label: string; value: any; color?: string }) {
    const bgColors: { [key: string]: string } = {
        blue: 'bg-blue-50 border-blue-200',
        gold: 'bg-yellow-50 border-yellow-200',
    };
    const textColors: { [key: string]: string } = {
        blue: 'text-blue-600',
        gold: 'text-yellow-600',
    };

    return (
        <div className={`${bgColors[color]} border rounded-lg p-4`}>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                {label}
            </div>
            <div className={`text-2xl font-bold ${textColors[color]}`}>
                {typeof value === 'number' ? value.toFixed(2) : value}
            </div>
        </div>
    );
}

/* Progress Stat Box Component */
function ProgressStatBox({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                {label}
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-3">{value.toFixed(2)}%</div>
            <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(value, 100)}%` }}
                />
            </div>
        </div>
    );
}
