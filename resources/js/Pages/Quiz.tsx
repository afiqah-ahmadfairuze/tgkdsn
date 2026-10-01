import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import TanganakDusunLayout from '@/Layouts/TanganakDusunLayout';
import { useLanguage } from '@/Contexts/LanguageContext';
import { PageProps } from '@/types';
import QuizCard from '@/Components/QuizCard';
import QuizPreviewModal from '@/Components/QuizPreviewModal';
import LeaderboardWidget from '@/Components/LeaderboardWidget';
import LeaderboardModal from '@/Components/LeaderboardModal';
import axios from 'axios';

interface QuizQuestion {
    id: number;
    question_text: string;
    [key: string]: any;
}

interface Quiz {
    id: number;
    title: string;
    description?: string;
    total_marks: number;
    category?: string;
    cover_image?: string | null;
    questions?: QuizQuestion[];
}

/*
 * QuizBoros page displaying available quizzes and leaderboard
 * Users can filter, search, and preview quizzes before starting
 */
export default function Quiz({ auth }: PageProps) {
    const { t } = useLanguage();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

    const backgroundStyle = {
        backgroundImage: 'url(/images/Hero.jpg)',
        backgroundAttachment: 'fixed' as const,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    /* Fetches available quizzes from the API */
    const fetchQuizzes = async () => {
        try {
            const response = await axios.get('/api/quiz/available');
            setQuizzes(response.data.quizzes);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    /* Opens the preview modal for a selected quiz */
    const handleOpenPreview = (quizId: number) => {
        const quiz = quizzes.find(q => q.id === quizId);
        if (quiz) {
            setSelectedQuiz(quiz);
            setShowPreviewModal(true);
        }
    };

    /* Extracts unique category names from quizzes */
    const getUniqueCategories = () => {
        const categories = quizzes
            .filter(quiz => quiz.category)
            .map(quiz => quiz.category as string);
        return Array.from(new Set(categories));
    };

    /* Filters quizzes by search query and category */
    const getFilteredQuizzes = () => {
        return quizzes.filter(quiz => {
            const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || quiz.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    };

    return (
        <TanganakDusunLayout auth={auth} title="Quiz - TanganakDusun" backgroundStyle={backgroundStyle}>
            <div className="py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FBBF24' }}>
                            {t({
                                en: 'QuizBoros - Word Quiz',
                                bm: 'Kuiz Perkataan'
                            })}
                        </h1>
                        <p className="text-lg text-gray-700">
                            {t({
                                en: 'Quiz time! Answer questions, collect points, and show how good you are at Dusun!',
                                bm: 'Masa untuk main kuiz! Jawab soalan, kumpul markah, dan buktikan anda hebat dalam bahasa Dusun!'
                            })}
                        </p>
                    </div>

                    {/* Leaderboard Widget */}
                    <div className="mb-8">
                        <LeaderboardWidget onViewFullLeaderboard={() => setShowLeaderboardModal(true)} />
                    </div>

                    {/* Search and Filter Section */}
                    {!loading && quizzes.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-8">
                            <h2 className="text-xl font-bold mb-6 text-gray-900">
                                {t({ en: 'Search and Filter', bm: 'Cari dan Tapis' })}
                            </h2>
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search Input */}
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t({
                                            en: 'Search quizzes by name...',
                                            bm: 'Cari kuiz mengikut nama...'
                                        })}
                                        className="w-full px-4 py-2 md:px-6 md:py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition text-sm md:text-base"
                                    />
                                </div>

                                {/* Category Filter Dropdown */}
                                <div className="md:w-48">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-4 py-2 md:px-6 md:py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-900 focus:outline-none focus:border-yellow-500 transition appearance-none cursor-pointer font-semibold text-sm md:text-base"
                                    >
                                        <option value="all">{t({ en: 'All Categories', bm: 'Semua Kategori' })}</option>
                                        {getUniqueCategories().map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Available Quizzes Section */}
                    <div className="mb-8">
                        {loading ? (
                            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center py-12">
                                <p className="text-lg text-gray-700">{t({ en: 'Loading quizzes...', bm: 'Memuatkan kuiz...' })}</p>
                            </div>
                        ) : quizzes.length > 0 ? (
                            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-8 md:p-12">
                                <h2 className="text-2xl font-bold mb-8 text-white">
                                    {t({ en: 'Available Quizzes', bm: 'Kuiz Tersedia' })} ({getFilteredQuizzes().length})
                                </h2>
                                {getFilteredQuizzes().length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                                        {getFilteredQuizzes().map((quiz) => (
                                            <QuizCard
                                                key={quiz.id}
                                                id={quiz.id}
                                                title={quiz.title}
                                                description={quiz.description}
                                                total_marks={quiz.total_marks}
                                                total_questions={quiz.questions?.length || 0}
                                                cover_image={quiz.cover_image}
                                                onOpenPreview={handleOpenPreview}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-lg text-gray-600">
                                            {t({
                                                en: 'No quizzes match your search.',
                                                bm: 'Tiada kuiz yang sepadan dengan carian anda.'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center py-12">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-lg text-gray-600">
                                    {t({
                                        en: 'No quizzes available yet.',
                                        bm: 'Tiada kuiz tersedia lagi.'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Leaderboard Modal */}
            <LeaderboardModal isOpen={showLeaderboardModal} onClose={() => setShowLeaderboardModal(false)} />

            {/* Quiz Preview Modal */}
            {selectedQuiz && (
                <QuizPreviewModal
                    isOpen={showPreviewModal}
                    quizId={selectedQuiz.id}
                    title={selectedQuiz.title}
                    description={selectedQuiz.description}
                    totalMarks={selectedQuiz.total_marks}
                    totalQuestions={selectedQuiz.questions?.length || 0}
                    coverImage={selectedQuiz.cover_image}
                    onClose={() => setShowPreviewModal(false)}
                />
            )}
        </TanganakDusunLayout>
    );
}
