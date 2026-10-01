import { useLanguage } from '@/Contexts/LanguageContext';
import { router } from '@inertiajs/react';

interface QuizPreviewModalProps {
    isOpen: boolean;
    quizId: number;
    title: string;
    description?: string;
    totalMarks: number;
    totalQuestions: number;
    coverImage?: string | null;
    onClose: () => void;
}

/*
 * Modal showing quiz details before starting
 * Displays cover image, description, question count, and total marks
 */
export default function QuizPreviewModal({
    isOpen,
    quizId,
    title,
    description,
    totalMarks,
    totalQuestions,
    coverImage,
    onClose,
}: QuizPreviewModalProps) {
    const { t } = useLanguage();

    if (!isOpen) return null;

    /* Navigates to the quiz taking page */
    const handleStartQuiz = () => {
        router.visit(`/quiz/${quizId}`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                        {t({ en: 'Quiz Preview', bm: 'Pratonton Kuiz' })}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                        {/* Cover Image - Left Side on Desktop/Tablet */}
                        <div className="flex flex-col items-center justify-center md:items-start">
                            {coverImage ? (
                                <div className="rounded-lg overflow-hidden shadow-md" style={{ width: '7cm', height: '7cm' }}>
                                    <img
                                        src={coverImage}
                                        alt={title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg shadow-md flex items-center justify-center" style={{ width: '7cm', height: '7cm' }}>
                                    <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Quiz Information - Right Side on Desktop/Tablet */}
                        <div className="flex flex-col" style={{ width: '7cm' }}>
                            {/* Title */}
                            <div className="mb-4">
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                    {title}
                                </h3>
                                {description && (
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {description}
                                    </p>
                                )}
                            </div>

                            {/* Quiz Details */}
                            <div className="space-y-3 mb-4">
                                {/* Total Questions */}
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600">
                                            {t({ en: 'Total Questions', bm: 'Jumlah Soalan' })}
                                        </p>
                                        <p className="text-lg font-bold text-blue-600">
                                            {totalQuestions}
                                        </p>
                                    </div>
                                </div>

                                {/* Total Marks */}
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600">
                                            {t({ en: 'Total Marks', bm: 'Jumlah Markah' })}
                                        </p>
                                        <p className="text-lg font-bold text-green-600">
                                            {totalMarks}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Start Quiz Button */}
                            <button
                                onClick={handleStartQuiz}
                                className="w-full px-4 py-2 md:py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-sm rounded-lg transition duration-150 shadow-md hover:shadow-lg"
                            >
                                {t({ en: 'Start Quiz', bm: 'Mulai Kuiz' })}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
