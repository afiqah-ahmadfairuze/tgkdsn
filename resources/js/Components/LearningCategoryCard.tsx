import { router } from '@inertiajs/react';

interface LearningCategoryCardProps {
    id: number;
    name: string;
    materialCount: number;
    onSelectCategory?: (categoryId: number) => void;
}

const colors = [
    'bg-red-600',
    'bg-orange-600',
    'bg-yellow-600',
    'bg-green-600',
    'bg-blue-600',
];

/*
 * Card for displaying a learning material category
 * Color is determined by category ID for consistency
 */
export default function LearningCategoryCard({ id, name, materialCount, onSelectCategory }: LearningCategoryCardProps) {
    // Generate consistent color for this category (based on id for consistency)
    const randomColor = colors[id % colors.length];

    /* Selects category and navigates to learning materials */
    const handleStartFlashcard = () => {
        if (onSelectCategory) {
            onSelectCategory(id);
        }
        router.visit(`/learning-materials/${id}`);
    };

    return (
        <div className={`${randomColor} rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 p-8 text-white h-full flex flex-col justify-between`}>
            <div className="flex flex-col space-y-4">
                {/* Category Name */}
                <h3 className="text-2xl font-bold">
                    {name}
                </h3>

                {/* Material Count */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="opacity-80">
                        Items:
                    </span>
                    <span className="font-semibold">
                        {materialCount}
                    </span>
                </div>
            </div>

            {/* Start Flashcard Button */}
            <button
                onClick={handleStartFlashcard}
                className="mt-6 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-md transition duration-150 text-center block"
            >
                Learn Now
            </button>
        </div>
    );
}
