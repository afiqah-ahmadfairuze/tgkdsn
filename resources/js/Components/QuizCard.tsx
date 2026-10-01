import { useLanguage } from '@/Contexts/LanguageContext';

interface QuizCardProps {
    id: number;
    title: string;
    description?: string;
    total_marks: number;
    total_questions?: number;
    cover_image?: string | null;
    onOpenPreview?: (quizId: number) => void;
}

const quizCardColor = 'bg-yellow-400';

/*
 * Card displaying a quiz with cover image
 * Clicking opens the quiz preview modal
 */
export default function QuizCard({
    id,
    title,
    description,
    total_marks,
    total_questions = 0,
    cover_image,
    onOpenPreview
}: QuizCardProps) {
    const { t } = useLanguage();

    /* Opens the quiz preview modal */
    const handlePreview = () => {
        if (onOpenPreview) {
            onOpenPreview(id);
        }
    };

    return (
        <div className={`${quizCardColor} rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 text-white h-full flex flex-col justify-between`}>
            {/* Outer Container with Padding for 0.5cm gap */}
            <div className="p-5 flex-1 flex flex-col">
                {/* Cover Image */}
                <div className="w-full h-40 sm:h-48 md:h-56 lg:h-64 bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center overflow-hidden rounded-md flex-1">
                    {cover_image ? (
                        <img
                            src={cover_image}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <svg className="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Start Quiz Button */}
            <div className="p-5 pt-0">
                <button
                    onClick={handlePreview}
                    className="w-full px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-md transition duration-150"
                >
                    {t({ en: 'Start Quiz', bm: 'Mulai Kuiz' })}
                </button>
            </div>
        </div>
    );
}
