import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminNavigation from '@/Components/AdminNavigation';
import ReportViewer from '@/Components/ReportViewer';
import axios from 'axios';
import { AlertCircle, Trash2, Printer } from 'lucide-react';

interface FeedbackItem {
    id: number;
    user_id: number;
    user_name: string;
    language: string;
    ease_of_use: string;
    learned_words: string;
    quiz_fun: string;
    virtual_tour: string;
    favourite_part: string | null;
    improvements: string | null;
    issue_reported: boolean;
    issue_type: string | null;
    issue_details: string | null;
    created_at: string;
}

interface FeedbackPageProps {
    auth: any;
    feedbacks: {
        data: FeedbackItem[];
        links: any;
        current_page: number;
        total: number;
        per_page: number;
    };
    languages: Array<{ value: string; label: string }>;
    search?: string;
    language?: string;
    ease_of_use?: string;
    learned_words?: string;
    quiz_fun?: string;
    virtual_tour?: string;
}

export default function Feedback({
    auth,
    feedbacks,
    languages,
    search: initialSearch = '',
    language: initialLanguage = '',
    ease_of_use: initialEaseOfUse = '',
    learned_words: initialLearnedWords = '',
    quiz_fun: initialQuizFun = '',
    virtual_tour: initialVirtualTour = '',
}: FeedbackPageProps) {
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [periodFilter, setPeriodFilter] = useState('overall');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
    const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<number[]>([]);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [showFeedbackReport, setShowFeedbackReport] = useState(false);
    const [reportPeriod, setReportPeriod] = useState<'overall' | 'today' | 'week' | 'month'>('overall');
    const [languageFilter, setLanguageFilter] = useState<string[]>(['en', 'bm']); // both languages by default
    const [reportLanguageFilter, setReportLanguageFilter] = useState<string[]>(['en', 'bm']); // both languages by default for report

    const feedbackOptions = {
        ease_of_use: ['Yes!', 'Okay', 'Hard'],
        learned_words: ['Yes!', 'A little', 'No'],
        quiz_fun: ['Yes!', 'Kind of', 'No'],
        virtual_tour: ['Yes!', 'It was okay', 'Not really'],
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.feedback.index'), {
            search: searchQuery,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleViewDetail = (feedback: FeedbackItem) => {
        setSelectedFeedback(feedback);
        setShowDetailModal(true);
    };

    const handleDeleteFeedback = async (feedbackId: number) => {
        if (confirm('Are you sure you want to delete this feedback?')) {
            setDeleteLoading(true);
            try {
                const response = await axios.delete(route('admin.feedback.destroy', feedbackId));
                if (response.data.success) {
                    alert(response.data.message || 'Feedback deleted successfully!');
                    setShowDetailModal(false);
                    setSelectedFeedback(null);
                    router.reload();
                }
            } catch (error: any) {
                console.error('Error deleting feedback:', error);
                alert('Error deleting feedback');
            } finally {
                setDeleteLoading(false);
            }
        }
    };

    const handleDeleteSelectedFeedbacks = async () => {
        if (selectedFeedbackIds.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedFeedbackIds.length} feedback(s)?`)) {
            setDeleteLoading(true);
            try {
                // Delete feedbacks one by one
                for (const id of selectedFeedbackIds) {
                    await axios.delete(route('admin.feedback.destroy', id));
                }
                alert('Feedbacks deleted successfully!');
                setSelectedFeedbackIds([]);
                router.reload();
            } catch (error: any) {
                console.error('Error deleting feedbacks:', error);
                alert('Error deleting feedbacks');
            } finally {
                setDeleteLoading(false);
            }
        }
    };

    const handleSelectFeedback = (feedbackId: number) => {
        setSelectedFeedbackIds((prev) =>
            prev.includes(feedbackId) ? prev.filter((id) => id !== feedbackId) : [...prev, feedbackId]
        );
    };

    const handleSelectAll = () => {
        if (selectedFeedbackIds.length === filteredFeedbacks.length) {
            setSelectedFeedbackIds([]);
        } else {
            setSelectedFeedbackIds(filteredFeedbacks.map((feedback) => feedback.id));
        }
    };

    const getLanguageLabel = (value: string) => {
        return languages.find(lang => lang.value === value)?.label || value;
    };

    const handleLanguageFilterChange = (lang: string) => {
        setLanguageFilter((prev) => {
            if (prev.includes(lang)) {
                // Remove if already selected
                return prev.filter((l) => l !== lang);
            } else {
                // Add if not selected
                return [...prev, lang];
            }
        });
    };

    const handleReportLanguageFilterChange = (lang: string) => {
        setReportLanguageFilter((prev) => {
            if (prev.includes(lang)) {
                return prev.filter((l) => l !== lang);
            } else {
                return [...prev, lang];
            }
        });
    };

    // Get filtered feedbacks by search and language
    const filteredFeedbacks = feedbacks.data.filter((feedback) => {
        const matchesSearch = feedback.user_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLanguage = languageFilter.length === 0 || languageFilter.includes(feedback.language);
        return matchesSearch && matchesLanguage;
    });

    // Calculate overview stats from filtered feedbacks
    const getTotalFeedback = () => filteredFeedbacks.length;

    const getRatingsDistribution = () => {
        const calculateRating = (feedback: FeedbackItem): 'excellent' | 'good' | 'poor' => {
            let positiveCount = 0;
            let negativeCount = 0;
            const totalItems = 5; // 4 feedback questions + 1 issue aspect

            // Evaluate each feedback item
            // 1. Ease of Use
            if (feedback.ease_of_use === 'Yes!') positiveCount++;
            else if (feedback.ease_of_use === 'Hard') negativeCount++;

            // 2. Learned Words
            if (feedback.learned_words === 'Yes!') positiveCount++;
            else if (feedback.learned_words === 'No') negativeCount++;

            // 3. Quiz Fun
            if (feedback.quiz_fun === 'Yes!') positiveCount++;
            else if (feedback.quiz_fun === 'No') negativeCount++;

            // 4. Virtual Tour
            if (feedback.virtual_tour === 'Yes!') positiveCount++;
            else if (feedback.virtual_tour === 'Not really') negativeCount++;

            // 5. Issue Report (no issue = positive)
            if (!feedback.issue_reported) positiveCount++;
            else negativeCount++;

            // Apply Majority Rule
            const positivePercentage = (positiveCount / totalItems) * 100;
            const negativePercentage = (negativeCount / totalItems) * 100;

            if (positivePercentage > 50) return 'excellent';
            if (negativePercentage > 50) return 'poor';
            return 'good';
        };

        return {
            excellent: filteredFeedbacks.filter(f => calculateRating(f) === 'excellent').length,
            good: filteredFeedbacks.filter(f => calculateRating(f) === 'good').length,
            poor: filteredFeedbacks.filter(f => calculateRating(f) === 'poor').length,
        };
    };

    const getTotalIssueReports = () => {
        return {
            reported: filteredFeedbacks.filter(f => f.issue_reported).length,
            noIssues: filteredFeedbacks.filter(f => !f.issue_reported).length,
        };
    };

    const ratings = getRatingsDistribution();
    const issues = getTotalIssueReports();
    const totalFeedback = getTotalFeedback();

    // Helper function to get component analysis
    const getComponentsAnalysis = (data: FeedbackItem[] = feedbacks.data) => {
        return {
            ease_of_use: {
                'Yes!': data.filter(f => f.ease_of_use === 'Yes!' || f.ease_of_use === 'Ya!').length,
                'Ya!': data.filter(f => f.ease_of_use === 'Ya!').length,
                'Okay': data.filter(f => f.ease_of_use === 'Okay').length,
                'Hard': data.filter(f => f.ease_of_use === 'Hard').length,
                'Susah': data.filter(f => f.ease_of_use === 'Susah').length,
            },
            learned_words: {
                'Yes!': data.filter(f => f.learned_words === 'Yes!' || f.learned_words === 'Ya!').length,
                'Ya!': data.filter(f => f.learned_words === 'Ya!').length,
                'A little': data.filter(f => f.learned_words === 'A little').length,
                'Sikit': data.filter(f => f.learned_words === 'Sikit').length,
                'No': data.filter(f => f.learned_words === 'No').length,
                'Tidak': data.filter(f => f.learned_words === 'Tidak').length,
            },
            quiz_fun: {
                'Yes!': data.filter(f => f.quiz_fun === 'Yes!' || f.quiz_fun === 'Ya!').length,
                'Ya!': data.filter(f => f.quiz_fun === 'Ya!').length,
                'Kind of': data.filter(f => f.quiz_fun === 'Kind of').length,
                'Biasa saja': data.filter(f => f.quiz_fun === 'Biasa saja').length,
                'No': data.filter(f => f.quiz_fun === 'No').length,
                'Tidak': data.filter(f => f.quiz_fun === 'Tidak').length,
            },
            virtual_tour: {
                'Yes!': data.filter(f => f.virtual_tour === 'Yes!' || f.virtual_tour === 'Ya!').length,
                'Ya!': data.filter(f => f.virtual_tour === 'Ya!').length,
                'It was okay': data.filter(f => f.virtual_tour === 'It was okay').length,
                'Okay saja': data.filter(f => f.virtual_tour === 'Okay saja').length,
                'Not really': data.filter(f => f.virtual_tour === 'Not really').length,
                'Tidak juga': data.filter(f => f.virtual_tour === 'Tidak juga').length,
            },
        };
    };

    // Helper function to get issues report
    const getIssuesReport = (data: FeedbackItem[] = feedbacks.data) => {
        const allIssues = data.filter(f => f.issue_reported);
        const issueTypeCount: { [key: string]: number } = {};

        allIssues.forEach(f => {
            if (f.issue_type) {
                issueTypeCount[f.issue_type] = (issueTypeCount[f.issue_type] || 0) + 1;
            }
        });

        return {
            total: allIssues.length,
            byType: issueTypeCount,
            details: allIssues,
        };
    };

    // Helper function to calculate percentages
    const getPercentage = (value: number, total: number) => {
        return total === 0 ? 0 : Math.round((value / total) * 100);
    };

    const componentsAnalysis = getComponentsAnalysis();
    const issuesReport = getIssuesReport();

    // Filter feedbacks based on report period and language
    const getFilteredReportFeedbacks = (languageCode?: string) => {
        let data = feedbacks.data;

        // Filter by language if specified
        if (languageCode) {
            data = data.filter(f => f.language === languageCode);
        } else if (reportLanguageFilter.length > 0) {
            data = data.filter(f => reportLanguageFilter.includes(f.language));
        }

        // Filter by period
        if (reportPeriod === 'overall') return data;

        const now = new Date();
        return data.filter((feedback) => {
            const feedbackDate = new Date(feedback.created_at);

            if (reportPeriod === 'today') {
                return feedbackDate.toDateString() === now.toDateString();
            } else if (reportPeriod === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return feedbackDate >= weekAgo;
            } else if (reportPeriod === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return feedbackDate >= monthAgo;
            }
            return true;
        });
    };

    const reportFeedbacks = getFilteredReportFeedbacks();
    const reportTotalFeedback = reportFeedbacks.length;
    const reportIssuesCount = reportFeedbacks.filter(f => f.issue_reported).length;

    // Calculate report-specific ratings distribution
    const getReportRatingsDistribution = (data: FeedbackItem[]) => {
        const calculateRating = (feedback: FeedbackItem): 'excellent' | 'good' | 'poor' => {
            let positiveCount = 0;
            let negativeCount = 0;
            const totalItems = 5;

            // Handle both English and BM responses for ease_of_use
            if (feedback.ease_of_use === 'Yes!' || feedback.ease_of_use === 'Ya!') positiveCount++;
            else if (feedback.ease_of_use === 'Hard' || feedback.ease_of_use === 'Susah') negativeCount++;

            // Handle both English and BM responses for learned_words
            if (feedback.learned_words === 'Yes!' || feedback.learned_words === 'Ya!') positiveCount++;
            else if (feedback.learned_words === 'No' || feedback.learned_words === 'Tidak') negativeCount++;

            // Handle both English and BM responses for quiz_fun
            if (feedback.quiz_fun === 'Yes!' || feedback.quiz_fun === 'Ya!') positiveCount++;
            else if (feedback.quiz_fun === 'No' || feedback.quiz_fun === 'Tidak') negativeCount++;

            // Handle both English and BM responses for virtual_tour
            if (feedback.virtual_tour === 'Yes!' || feedback.virtual_tour === 'Ya!') positiveCount++;
            else if (feedback.virtual_tour === 'Not really' || feedback.virtual_tour === 'Tidak juga') negativeCount++;

            if (!feedback.issue_reported) positiveCount++;
            else negativeCount++;

            const positivePercentage = (positiveCount / totalItems) * 100;
            const negativePercentage = (negativeCount / totalItems) * 100;

            if (positivePercentage > 50) return 'excellent';
            if (negativePercentage > 50) return 'poor';
            return 'good';
        };

        return {
            excellent: data.filter(f => calculateRating(f) === 'excellent').length,
            good: data.filter(f => calculateRating(f) === 'good').length,
            poor: data.filter(f => calculateRating(f) === 'poor').length,
        };
    };

    const reportRatings = getReportRatingsDistribution(reportFeedbacks);
    const reportComponentsAnalysis = getComponentsAnalysis(reportFeedbacks);

    // Format period display with dates
    const getFormattedPeriod = () => {
        const now = new Date();

        if (reportPeriod === 'overall') {
            return 'Overall';
        } else if (reportPeriod === 'today') {
            const todayStr = now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            return `Today (${todayStr})`;
        } else if (reportPeriod === 'week') {
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
        } else if (reportPeriod === 'month') {
            const monthStr = now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
            });
            return `This Month (${monthStr})`;
        }
        return 'Overall';
    };

    // Helper function to render a report section for a specific language
    const renderReportSection = (languageCode: 'en' | 'bm', languageLabel: string) => {
        // Get filtered feedbacks for this specific language
        const langFeedbacks = getFilteredReportFeedbacks(languageCode);
        const langTotalFeedback = langFeedbacks.length;
        const langIssuesCount = langFeedbacks.filter(f => f.issue_reported).length;

        // Calculate language-specific stats
        const langRatings = getReportRatingsDistribution(langFeedbacks);
        const langComponentsAnalysis = getComponentsAnalysis(langFeedbacks);

        return (
            <div key={languageCode}>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
                    {languageLabel} Feedback Report
                </h2>

                {/* Period Section */}
                <div className="mb-8">
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                        Period: <span className="text-lg font-semibold text-gray-800">{getFormattedPeriod()}</span>
                    </p>
                </div>

                {/* Total Feedbacks Received Section */}
                <div className="mb-8">
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                        Total Feedbacks Received: <span className="text-lg font-semibold text-gray-800">{langTotalFeedback}</span>
                    </p>
                </div>

                {/* Total Issues Reported Section */}
                <div className="mb-8">
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                        Total Issues Reported: <span className="text-lg font-semibold text-gray-800">{langIssuesCount}</span>
                    </p>
                </div>

                {/* Ratings Analysis */}
                <div className="mt-10">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Analysis</h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse text-xs sm:text-sm">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-800 bg-gray-50">Rating Category</th>
                                    <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-800 bg-gray-50">Count</th>
                                    <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-800 bg-gray-50">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800">Excellent</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langRatings.excellent}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langRatings.excellent, langTotalFeedback)}%</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800">Good</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langRatings.good}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langRatings.good, langTotalFeedback)}%</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800">Poor</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langRatings.poor}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langRatings.poor, langTotalFeedback)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Feedback Components Analysis */}
                <div className="mt-10">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Feedback Components Analysis</h3>

                    <div className="space-y-6">
                        {/* Ease of Use */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Was this website easy to use?</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse text-xs sm:text-sm">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-800 bg-gray-50">Response</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-800 bg-gray-50">Count</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-800 bg-gray-50">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-800">{languageCode === 'en' ? 'Yes!' : 'Ya!'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langComponentsAnalysis.ease_of_use[languageCode === 'en' ? 'Yes!' : 'Ya!']}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langComponentsAnalysis.ease_of_use[languageCode === 'en' ? 'Yes!' : 'Ya!'], langTotalFeedback)}%</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-2 text-gray-800">{languageCode === 'en' ? 'Okay' : 'Okay'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langComponentsAnalysis.ease_of_use['Okay']}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langComponentsAnalysis.ease_of_use['Okay'], langTotalFeedback)}%</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-800">{languageCode === 'en' ? 'Hard' : 'Susah'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langComponentsAnalysis.ease_of_use[languageCode === 'en' ? 'Hard' : 'Susah']}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langComponentsAnalysis.ease_of_use[languageCode === 'en' ? 'Hard' : 'Susah'], langTotalFeedback)}%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Learned Words */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Did you learn new Dusun words today?</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse text-xs sm:text-sm">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-800 bg-gray-50">Response</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-800 bg-gray-50">Count</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-800 bg-gray-50">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-800">{languageCode === 'en' ? 'Yes!' : 'Ya!'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langComponentsAnalysis.learned_words[languageCode === 'en' ? 'Yes!' : 'Ya!']}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langComponentsAnalysis.learned_words[languageCode === 'en' ? 'Yes!' : 'Ya!'], langTotalFeedback)}%</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-2 text-gray-800">{languageCode === 'en' ? 'A little' : 'Sikit'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langComponentsAnalysis.learned_words[languageCode === 'en' ? 'A little' : 'Sikit']}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langComponentsAnalysis.learned_words[languageCode === 'en' ? 'A little' : 'Sikit'], langTotalFeedback)}%</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-800">{languageCode === 'en' ? 'No' : 'Tidak'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langComponentsAnalysis.learned_words[languageCode === 'en' ? 'No' : 'Tidak']}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langComponentsAnalysis.learned_words[languageCode === 'en' ? 'No' : 'Tidak'], langTotalFeedback)}%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Quiz Fun */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Were the quizzes fun?</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse text-xs sm:text-sm">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-800 bg-gray-50">Response</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-800 bg-gray-50">Count</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-800 bg-gray-50">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-800">{languageCode === 'en' ? 'Yes!' : 'Ya!'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langComponentsAnalysis.quiz_fun[languageCode === 'en' ? 'Yes!' : 'Ya!']}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langComponentsAnalysis.quiz_fun[languageCode === 'en' ? 'Yes!' : 'Ya!'], langTotalFeedback)}%</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-2 text-gray-800">{languageCode === 'en' ? 'Kind of' : 'Biasa saja'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langComponentsAnalysis.quiz_fun[languageCode === 'en' ? 'Kind of' : 'Biasa saja']}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langComponentsAnalysis.quiz_fun[languageCode === 'en' ? 'Kind of' : 'Biasa saja'], langTotalFeedback)}%</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-800">{languageCode === 'en' ? 'No' : 'Tidak'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langComponentsAnalysis.quiz_fun[languageCode === 'en' ? 'No' : 'Tidak']}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langComponentsAnalysis.quiz_fun[languageCode === 'en' ? 'No' : 'Tidak'], langTotalFeedback)}%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Virtual Tour */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Did you enjoy the virtual tour?</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse text-xs sm:text-sm">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-800 bg-gray-50">Response</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-800 bg-gray-50">Count</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-800 bg-gray-50">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-800">{languageCode === 'en' ? 'Yes!' : 'Ya!'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langComponentsAnalysis.virtual_tour[languageCode === 'en' ? 'Yes!' : 'Ya!']}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langComponentsAnalysis.virtual_tour[languageCode === 'en' ? 'Yes!' : 'Ya!'], langTotalFeedback)}%</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-2 text-gray-800">{languageCode === 'en' ? 'It was okay' : 'Okay saja'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langComponentsAnalysis.virtual_tour[languageCode === 'en' ? 'It was okay' : 'Okay saja']}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langComponentsAnalysis.virtual_tour[languageCode === 'en' ? 'It was okay' : 'Okay saja'], langTotalFeedback)}%</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-800">{languageCode === 'en' ? 'Not really' : 'Tidak juga'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{langComponentsAnalysis.virtual_tour[languageCode === 'en' ? 'Not really' : 'Tidak juga']}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{getPercentage(langComponentsAnalysis.virtual_tour[languageCode === 'en' ? 'Not really' : 'Tidak juga'], langTotalFeedback)}%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Issues */}
                {langFeedbacks.filter(f => f.issue_reported).length > 0 && (
                    <div className="mt-10">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Issues</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse text-xs sm:text-sm">
                                <thead>
                                    <tr>
                                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">User</th>
                                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Issue Type</th>
                                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Issue Details</th>
                                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {langFeedbacks.filter(f => f.issue_reported).map((feedback) => (
                                        <tr key={feedback.id}>
                                            <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{feedback.user_name}</td>
                                            <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{feedback.issue_type || 'N/A'}</td>
                                            <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{feedback.issue_details || 'N/A'}</td>
                                            <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{feedback.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Show feedback report if requested
    if (showFeedbackReport) {
        return (
            <>
                <Head title="Feedback Report - Admin Panel" />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="print:hidden">
                        <AdminNavigation themeColor="#A66BFF" />
                    </div>

                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
                        {/* Report Header - Hidden on Print */}
                        <div className="print:hidden mb-6 sm:mb-8">
                            <button
                                onClick={() => setShowFeedbackReport(false)}
                                className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                ← Back to Feedbacks & Reports
                            </button>
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Feedback Report</h1>

                                {/* Report Filters */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                                    {/* Period Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Period:</label>
                                        <select
                                            value={reportPeriod}
                                            onChange={(e) => setReportPeriod(e.target.value as 'overall' | 'today' | 'week' | 'month')}
                                            className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="overall">Overall</option>
                                            <option value="today">Today</option>
                                            <option value="week">This Week</option>
                                            <option value="month">This Month</option>
                                        </select>
                                    </div>

                                    {/* Language Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Language:</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={reportLanguageFilter.includes('en')}
                                                    onChange={() => handleReportLanguageFilterChange('en')}
                                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                                                />
                                                <span className="text-xs sm:text-sm text-gray-700">English</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={reportLanguageFilter.includes('bm')}
                                                    onChange={() => handleReportLanguageFilterChange('bm')}
                                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                                                />
                                                <span className="text-xs sm:text-sm text-gray-700">Bahasa Melayu</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Print Button */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={() => window.print()}
                                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm font-medium"
                                        >
                                            🖨️ Print Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Content */}
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                            {reportLanguageFilter.length === 2 ? (
                                // Both languages selected - show two separate sections
                                <>
                                    {renderReportSection('en', 'English')}

                                    {/* Separator between language sections */}
                                    <div className="my-12 border-t-4 border-purple-500"></div>

                                    {renderReportSection('bm', 'Bahasa Melayu')}
                                </>
                            ) : reportLanguageFilter.includes('en') ? (
                                // Only English selected
                                renderReportSection('en', 'English')
                            ) : reportLanguageFilter.includes('bm') ? (
                                // Only Bahasa Melayu selected
                                renderReportSection('bm', 'Bahasa Melayu')
                            ) : (
                                // No language selected - show message
                                <div className="text-center py-12">
                                    <p className="text-gray-600">Please select at least one language to view the report.</p>
                                </div>
                            )}

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

    // Show report viewer if a report is selected
    if (selectedReport) {
        return (
            <>
                <Head title="Feedback Management - Admin Panel" />
                <div className="min-h-screen bg-gray-100">
                    <div className="print:hidden">
                        <AdminNavigation themeColor="#A66BFF" />
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
            <Head title="Feedbacks & Reports - TanganakDusun" />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <AdminNavigation themeColor="#A66BFF" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Heading */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-purple-600" />
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                                Feedbacks & Reports
                            </h1>
                        </div>
                        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                            Collect and analyze user feedback to improve your platform
                        </p>
                    </div>

                    <div className="flex flex-col-reverse lg:flex-row lg:items-start gap-5">
                        {/* Main Content */}
                        <div className="flex-1 min-w-0 flex flex-col gap-5">
                            {/* Feedback Overview Card */}
                            <div>
                                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-t-4 border-purple-500">
                                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                        <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Feedbacks & Reports Overview</h2>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Period:</label>
                                            <select
                                                value={periodFilter}
                                                onChange={(e) => setPeriodFilter(e.target.value)}
                                                className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="overall">Overall</option>
                                                <option value="week">This Week</option>
                                                <option value="month">This Month</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Language:</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={languageFilter.includes('en')}
                                                        onChange={() => handleLanguageFilterChange('en')}
                                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                                                    />
                                                    <span className="text-xs sm:text-sm text-gray-700">English</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={languageFilter.includes('bm')}
                                                        onChange={() => handleLanguageFilterChange('bm')}
                                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                                                    />
                                                    <span className="text-xs sm:text-sm text-gray-700">Bahasa Melayu</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                                        {/* Feedbacks Received Card */}
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border border-purple-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">Feedbacks Received</p>
                                            <p className="text-3xl sm:text-4xl font-bold text-purple-600">{totalFeedback}</p>
                                        </div>

                                        {/* Issues Reported Card */}
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border border-purple-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">Issues Reported</p>
                                            <p className="text-3xl sm:text-4xl font-bold text-purple-600">{issues.reported}</p>
                                        </div>

                                        {/* Ratings Distribution Card */}
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border border-purple-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">Ratings Distribution</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-700">Excellent</span>
                                                    <span className="font-bold text-purple-600">{ratings.excellent}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-700">Good</span>
                                                    <span className="font-bold text-purple-600">{ratings.good}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-700">Poor</span>
                                                    <span className="font-bold text-purple-600">{ratings.poor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search Bar and Action Buttons */}
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                                <div className="flex flex-row items-center gap-2 sm:gap-3">
                                    {/* Search Form */}
                                    <form onSubmit={handleSearch} className="flex-1 min-w-0">
                                        <div className="relative">
                                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search by user name..."
                                                className="w-full pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                            />
                                        </div>
                                    </form>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                        <button
                                            onClick={() => {
                                                if (selectedFeedbackIds.length === 1) {
                                                    const feedback = filteredFeedbacks.find(f => f.id === selectedFeedbackIds[0]);
                                                    if (feedback) handleViewDetail(feedback);
                                                }
                                            }}
                                            disabled={selectedFeedbackIds.length !== 1}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            title={selectedFeedbackIds.length === 1 ? "View selected feedback" : "Select exactly 1 feedback to view"}
                                        >
                                            <span>View</span>
                                        </button>
                                        <button
                                            onClick={handleDeleteSelectedFeedbacks}
                                            disabled={selectedFeedbackIds.length === 0}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            title={selectedFeedbackIds.length > 0 ? `Delete ${selectedFeedbackIds.length} selected feedback(s)` : "Select feedback(s) to delete"}
                                        >
                                            <Trash2 className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Feedbacks Table */}
                            {filteredFeedbacks.length === 0 ? (
                                <div className="text-center py-12 sm:py-16">
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900">Not found</h3>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                    <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[600px]">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-purple-600 text-white sticky top-0">
                                                <tr>
                                                    <th className="px-1 sm:px-2 py-1 sm:py-2 text-left whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedFeedbackIds.length === filteredFeedbacks.length && filteredFeedbacks.length > 0}
                                                            onChange={handleSelectAll}
                                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-3 h-3 sm:w-4 sm:h-4"
                                                        />
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Name</th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Language</th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Issues</th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredFeedbacks.map((feedback, idx) => (
                                                    <tr key={feedback.id} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-purple-50 transition`}>
                                                        <td className="px-1 sm:px-2 py-1 sm:py-2 whitespace-nowrap">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFeedbackIds.includes(feedback.id)}
                                                                onChange={() => handleSelectFeedback(feedback.id)}
                                                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-3 h-3 sm:w-4 sm:h-4"
                                                            />
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap max-w-xs truncate">
                                                            {feedback.user_name}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600">
                                                            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                                                                feedback.language === 'en'
                                                                    ? 'bg-purple-100 text-purple-800'
                                                                    : 'bg-purple-100 text-purple-800'
                                                            }`}>
                                                                {getLanguageLabel(feedback.language)}
                                                            </span>
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                                            {feedback.issue_reported ? (
                                                                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                                    Yes
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                                    No
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{feedback.created_at}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar - About & Tips Card */}
                        <div className="w-full lg:w-72 lg:sticky lg:top-8 h-fit flex-shrink-0">
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-4 sm:p-6 border border-purple-100">
                                <div className="space-y-4">
                                    {/* About Section */}
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">About</h3>
                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                            Collect and analyze user feedback to understand learner experience. Review responses about ease of use, learning effectiveness, feature engagement, satisfaction levels, and reported issues to continuously improve your platform.
                                        </p>
                                    </div>

                                    {/* Rating Categories Section */}
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Rating Categories</h3>
                                        <div className="space-y-2">
                                            <div className="text-xs sm:text-sm">
                                                <span className="font-semibold text-green-700">Excellent</span>
                                                <p className="text-gray-700 ml-3">&gt; 50% of criteria are positive (3+ out of 5 positive)</p>
                                            </div>
                                            <div className="text-xs sm:text-sm">
                                                <span className="font-semibold text-blue-700">Good</span>
                                                <p className="text-gray-700 ml-3">Neither excellent nor poor (mix of positive/negative)</p>
                                            </div>
                                            <div className="text-xs sm:text-sm">
                                                <span className="font-semibold text-red-700">Poor</span>
                                                <p className="text-gray-700 ml-3">&gt; 50% of criteria are negative (3+ out of 5 negative)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tips Section */}
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Tips</h3>
                                        <ul className="text-xs sm:text-sm text-gray-700 space-y-1 sm:space-y-2 list-disc list-inside">
                                            <li>Review detailed feedback in the table</li>
                                            <li>Monitor issue reports for improvements</li>
                                            <li>Track ratings distribution patterns</li>
                                            <li>Use feedback to enhance user experience</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* View & Print Feedback Report Card */}
                            <button
                                onClick={() => setShowFeedbackReport(true)}
                                className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 text-left border border-gray-200 mt-3"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <Printer className="h-10 w-10 text-purple-600" />
                                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                                        Print Report
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    View & Print Feedback Report
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Generate and print a detailed feedback analysis report with statistics and insights
                                </p>
                                <div className="flex items-center text-purple-600 font-medium text-sm hover:text-purple-600-dark">
                                    View Report →
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedFeedback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                Feedback Detail - {selectedFeedback.user_name}
                            </h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* User Info */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">User Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500">User ID</label>
                                        <p className="text-sm font-medium text-gray-900">{selectedFeedback.user_id}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Full Name</label>
                                        <p className="text-sm font-medium text-gray-900">{selectedFeedback.user_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Language</label>
                                        <p className="text-sm font-medium text-gray-900">{getLanguageLabel(selectedFeedback.language)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Submitted</label>
                                        <p className="text-sm font-medium text-gray-900">{selectedFeedback.created_at}</p>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/* Feedback Answers */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Feedback Answers</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Was this website easy to use?</label>
                                        <p className="text-sm font-medium text-gray-900">{selectedFeedback.ease_of_use}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Did you learn new Dusun words today?</label>
                                        <p className="text-sm font-medium text-gray-900">{selectedFeedback.learned_words}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Were the quizzes fun?</label>
                                        <p className="text-sm font-medium text-gray-900">{selectedFeedback.quiz_fun}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Did you enjoy the virtual tour?</label>
                                        <p className="text-sm font-medium text-gray-900">{selectedFeedback.virtual_tour}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">What was your favourite part?</label>
                                        <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{selectedFeedback.favourite_part || '(Not provided)'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">What should we improve?</label>
                                        <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{selectedFeedback.improvements || '(Not provided)'}</p>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/* Issue Reporting Section */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Issue Report</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Issue Reported</label>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedFeedback.issue_reported ? (
                                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                                    Yes - Issue Reported
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                                    No issues
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    {selectedFeedback.issue_reported && selectedFeedback.issue_type && (
                                        <>
                                            <div>
                                                <label className="text-xs text-gray-500">Issue Type</label>
                                                <p className="text-sm font-medium text-gray-900">{selectedFeedback.issue_type}</p>
                                            </div>
                                            {selectedFeedback.issue_details && (
                                                <div>
                                                    <label className="text-xs text-gray-500">Issue Details</label>
                                                    <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{selectedFeedback.issue_details}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                                disabled={deleteLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition disabled:opacity-50"
                            >
                                Delete Feedback
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
