import { useEffect, useState } from 'react';
import TanganakDusunLayout from '@/Layouts/TanganakDusunLayout';
import { useLanguage } from '@/Contexts/LanguageContext';
import { PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import axios from 'axios';

interface QuizResultsProps extends PageProps {
    attemptId: string;
}

interface ResultData {
    quiz_title: string;
    marks_obtained: number;
    total_marks: number;
    percentage: number;
    passed: boolean;
    attempted_at: string;
}

export default function QuizResults({ auth, attemptId }: QuizResultsProps) {
    const { t } = useLanguage();
    const [resultData, setResultData] = useState<ResultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const backgroundStyle = {
        backgroundImage: 'url(/images/Hero.jpg)',
        backgroundAttachment: 'fixed' as const,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    };

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/quiz/attempt/${attemptId}`);
                setResultData(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load results');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [attemptId]);

    if (loading) {
        return (
            <TanganakDusunLayout auth={auth} title="Quiz Results - TanganakDusun" backgroundStyle={backgroundStyle}>
                <div className="flex items-center justify-center py-8 px-4 min-h-screen">
                    <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
                        <p className="text-gray-600">{t({ en: 'Loading results...', bm: 'Sedang memuatkan hasil...' })}</p>
                    </div>
                </div>
            </TanganakDusunLayout>
        );
    }

    if (error || !resultData) {
        return (
            <TanganakDusunLayout auth={auth} title="Quiz Results - TanganakDusun" backgroundStyle={backgroundStyle}>
                <div className="flex items-center justify-center py-8 px-4 min-h-screen">
                    <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
                        <p className="text-red-600 mb-4">{error || t({ en: 'Unable to load results', bm: 'Tidak dapat memuat hasil' })}</p>
                        <Link href="/quiz" className="text-blue-600 hover:text-blue-800">
                            {t({ en: 'Back to Quizzes', bm: 'Kembali ke Kuiz' })}
                        </Link>
                    </div>
                </div>
            </TanganakDusunLayout>
        );
    }

    // Calculate performance level
    const getPerformanceLevel = (percentage: number) => {
        if (percentage >= 90) return { en: 'Excellent', bm: 'Cemerlang', color: 'text-green-600' };
        if (percentage >= 75) return { en: 'Good', bm: 'Baik', color: 'text-blue-600' };
        if (percentage >= 60) return { en: 'Fair', bm: 'Lumayan', color: 'text-yellow-600' };
        return { en: 'Needs Improvement', bm: 'Perlu Ditingkatkan', color: 'text-red-600' };
    };

    const performance = getPerformanceLevel(resultData.percentage);

    return (
        <TanganakDusunLayout auth={auth} title={`${resultData.quiz_title} - Results`} backgroundStyle={backgroundStyle}>
            <div className="flex items-center justify-center py-8 px-4 min-h-screen">
                {/* Results Container */}
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-8 text-white text-center">
                            <h1 className="text-4xl font-bold mb-2">
                                {t({ en: 'Quiz Complete!', bm: 'Kuiz Selesai!' })}
                            </h1>
                            <p className="text-lg opacity-90">{resultData.quiz_title}</p>
                        </div>

                        {/* Score Display */}
                        <div className="p-8 text-center">
                            {/* Large Score Circle */}
                            <div className="mb-8">
                                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-green-100 border-4 border-blue-500">
                                    <div>
                                        <p className="text-5xl font-bold text-blue-600">
                                            {resultData.marks_obtained}
                                        </p>
                                        <p className="text-lg text-gray-600">
                                            / {resultData.total_marks}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Percentage */}
                            <div className="mb-6">
                                <p className={`text-3xl font-bold ${performance.color}`}>
                                    {resultData.percentage}%
                                </p>
                                <p className={`text-lg font-semibold ${performance.color}`}>
                                    {performance.en}
                                </p>
                            </div>

                            {/* Performance Message */}
                            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                                {resultData.percentage >= 60 ? (
                                    <p className="text-gray-800">
                                        {t({
                                            en: '🎉 Great job! You passed the quiz!',
                                            bm: '🎉 Bagus! Anda lulus kuiz!'
                                        })}
                                    </p>
                                ) : (
                                    <p className="text-gray-800">
                                        {t({
                                            en: 'Keep practicing! Try again to improve your score.',
                                            bm: 'Terus berlatih! Cuba lagi untuk meningkatkan markah anda.'
                                        })}
                                    </p>
                                )}
                            </div>

                            {/* Attempted Date */}
                            <p className="text-sm text-gray-500 mb-8">
                                {t({ en: 'Attempted on:', bm: 'Dicuba pada:' })} {new Date(resultData.attempted_at).toLocaleDateString()}
                            </p>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Link
                                    href="/quiz"
                                    className="block w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-center transition"
                                >
                                    {t({ en: 'Back to Quizzes', bm: 'Kembali ke Kuiz' })}
                                </Link>
                                <Link
                                    href="/user-profile"
                                    className="block w-full py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg text-center transition"
                                >
                                    {t({ en: 'View Profile', bm: 'Lihat Profil' })}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TanganakDusunLayout>
    );
}
