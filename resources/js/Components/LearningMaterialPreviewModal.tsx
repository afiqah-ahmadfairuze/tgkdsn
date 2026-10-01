import { useLanguage } from '@/Contexts/LanguageContext';
import { router } from '@inertiajs/react';

interface LearningMaterialPreviewModalProps {
    isOpen: boolean;
    materialId: number;
    title: string;
    description?: string | null;
    category?: string | null;
    flashcardCount: number;
    coverImage?: string | null;
    onClose: () => void;
}

/*
 * Modal showing learning material details before starting
 * Displays cover image, description, category, and flashcard count
 */
export default function LearningMaterialPreviewModal({
    isOpen,
    materialId,
    title,
    description,
    category,
    flashcardCount,
    coverImage,
    onClose,
}: LearningMaterialPreviewModalProps) {
    const { t } = useLanguage();

    if (!isOpen) return null;

    /* Navigates to the learning material flashcard page */
    const handleLearnNow = () => {
        router.visit(`/learning-materials/${materialId}`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                        {t({ en: 'Learning Material Preview', bm: 'Pratonton Bahan Pembelajaran' })}
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
                                <div className="rounded-lg overflow-hidden shadow-md bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center" style={{ width: '7cm', height: '7cm' }}>
                                    <img
                                        src={coverImage}
                                        alt={title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-md flex items-center justify-center" style={{ width: '7cm', height: '7cm' }}>
                                    <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Material Information - Right Side on Desktop/Tablet */}
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

                            {/* Material Details */}
                            <div className="space-y-3 mb-4">
                                {/* Category */}
                                {category && (
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.585l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-600">
                                                {t({ en: 'Category', bm: 'Kategori' })}
                                            </p>
                                            <p className="text-lg font-bold text-blue-600">
                                                {category}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Total Flashcards */}
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600">
                                            {t({ en: 'Total Flashcards', bm: 'Jumlah Kad Imbas' })}
                                        </p>
                                        <p className="text-lg font-bold text-green-600">
                                            {flashcardCount}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Learn Now Button */}
                            <button
                                onClick={handleLearnNow}
                                className="w-full px-4 py-2 md:py-3 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-lg transition duration-150 shadow-md hover:shadow-lg"
                            >
                                {t({ en: 'Learn Now', bm: 'Mulai Belajar' })}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
