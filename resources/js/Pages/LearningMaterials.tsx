import TanganakDusunLayout from '@/Layouts/TanganakDusunLayout';
import { useLanguage } from '@/Contexts/LanguageContext';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface LearningCategory {
    id: number;
    name: string;
    description: string | null;
}

interface LearningMaterial {
    id: number;
    learning_category_id: number;
    title: string;
    meaning: string;
    example_sentence: string | null;
    image_url: string;
}

interface LearningMaterialsData {
    materials: LearningMaterial[];
    categories: LearningCategory[];
}

/*
 * DusLearn flashcard learning page
 * Interactive flashcards that flip to reveal Dusun words and meanings
 */
export default function LearningMaterials({ auth }: PageProps) {
    const { t } = useLanguage();

    const backgroundStyle = {
        backgroundImage: 'url(/images/Hero.jpg)',
        backgroundAttachment: 'fixed' as const,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    };

    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState<LearningMaterial[]>([]);
    const [categories, setCategories] = useState<LearningCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    /* Fetches all learning materials and categories from API */
    const fetchMaterials = async () => {
        try {
            const response = await axios.get(route('learning-materials.public'));
            setMaterials(response.data.materials);
            setCategories(response.data.categories);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching materials:', error);
            setLoading(false);
        }
    };

    const filteredMaterials = selectedCategoryId
        ? materials.filter(m => m.learning_category_id === selectedCategoryId)
        : materials;

    const displayedMaterials = isShuffle
        ? [...filteredMaterials].sort(() => Math.random() - 0.5)
        : filteredMaterials;

    const currentMaterial = displayedMaterials.length > 0 ? displayedMaterials[currentIndex] : null;

    /* Advances to the next flashcard */
    const handleNext = () => {
        if (currentIndex < displayedMaterials.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        }
    };

    /* Goes back to the previous flashcard */
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
        }
    };

    /* Flips the flashcard to show/hide answer */
    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    /* Toggles shuffle mode for randomized card order */
    const handleShuffle = () => {
        setIsShuffle(!isShuffle);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    /* Filters cards by selected category */
    const handleCategoryChange = (categoryId: number | null) => {
        setSelectedCategoryId(categoryId);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    if (loading) {
        return (
            <TanganakDusunLayout auth={auth} title="DusLearn - Learning Materials" backgroundStyle={backgroundStyle}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-gray-900">Loading learning materials...</div>
                </div>
            </TanganakDusunLayout>
        );
    }

    return (
        <TanganakDusunLayout auth={auth} title="DusLearn - Learning Materials" backgroundStyle={backgroundStyle}>
            {/* Main Content */}
            <div>
                {/* Main Content Section */}
                <section className="py-12 md:py-16">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                {t({
                                    en: 'DusLearn - Flashcards',
                                    bm: 'DusLearn - Kad Imbas'
                                })}
                            </h1>
                            <p className="text-xl text-gray-700">
                                {t({
                                    en: 'Learn Dusun words with interactive flashcards',
                                    bm: 'Belajar perkataan Dusun dengan kad imbas interaktif'
                                })}
                            </p>
                        </div>

                        {/* Category Filter */}
                        <div className="bg-white/95 rounded-lg shadow-lg p-6 mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {t({
                                    en: 'Select Category:',
                                    bm: 'Pilih Kategori:'
                                })}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleCategoryChange(null)}
                                    className={`px-4 py-2 rounded-full font-medium transition ${
                                        selectedCategoryId === null
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                >
                                    {t({ en: 'All Categories', bm: 'Semua Kategori' })}
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryChange(category.id)}
                                        className={`px-4 py-2 rounded-full font-medium transition ${
                                            selectedCategoryId === category.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Flashcard Display */}
                        {displayedMaterials.length > 0 ? (
                            <div className="bg-white/95 rounded-lg shadow-lg p-8">
                                {/* Progress Indicator */}
                                <div className="text-center mb-6">
                                    <p className="text-lg text-gray-600 font-medium">
                                        Card {currentIndex + 1} of {displayedMaterials.length}
                                    </p>
                                    <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${((currentIndex + 1) / displayedMaterials.length) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Flashcard */}
                                <div
                                    onClick={handleFlip}
                                    className="perspective cursor-pointer h-80 md:h-96 mb-8"
                                >
                                    <div
                                        className="relative w-full h-full transition-transform duration-500 transform-gpu"
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                        }}
                                    >
                                        {/* Front of Card - Image */}
                                        <div
                                            className="absolute w-full h-full bg-gradient-to-br from-blue-500 to-tgkdsn-dark rounded-lg shadow-2xl p-6 flex flex-col items-center justify-center text-white"
                                            style={{ backfaceVisibility: 'hidden' }}
                                        >
                                            <div className="w-full h-full flex items-center justify-center">
                                                <img
                                                    src={currentMaterial!.image_url}
                                                    alt={currentMaterial!.title}
                                                    className="max-h-full max-w-full object-contain rounded-lg"
                                                />
                                            </div>
                                            <p className="mt-4 text-center text-sm opacity-75">
                                                {t({
                                                    en: 'Click to reveal answer',
                                                    bm: 'Klik untuk lihat jawapan'
                                                })}
                                            </p>
                                        </div>

                                        {/* Back of Card - Text */}
                                        <div
                                            className="absolute w-full h-full bg-gradient-to-br from-green-500 to-tgkdsn-dark rounded-lg shadow-2xl p-6 flex flex-col items-center justify-center text-white"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                transform: 'rotateY(180deg)',
                                            }}
                                        >
                                            <div className="text-center">
                                                <h2 className="text-5xl font-bold mb-6">{currentMaterial!.title}</h2>
                                                <hr className="my-4 border-white/30" />
                                                <p className="text-2xl mb-6">{currentMaterial!.meaning}</p>
                                                {currentMaterial!.example_sentence && (
                                                    <>
                                                        <hr className="my-4 border-white/30" />
                                                        <p className="text-sm italic opacity-90">
                                                            "{currentMaterial!.example_sentence}"
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentIndex === 0}
                                        className="w-full md:w-auto px-6 py-3 bg-gray-400 text-white rounded-lg font-medium hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        ← {t({ en: 'Previous', bm: 'Sebelumnya' })}
                                    </button>

                                    <button
                                        onClick={handleFlip}
                                        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                                    >
                                        {t({
                                            en: isFlipped ? 'Show Image' : 'Show Answer',
                                            bm: isFlipped ? 'Tunjuk Imej' : 'Tunjuk Jawapan'
                                        })}
                                    </button>

                                    <button
                                        onClick={handleNext}
                                        disabled={currentIndex === displayedMaterials.length - 1}
                                        className="w-full md:w-auto px-6 py-3 bg-gray-400 text-white rounded-lg font-medium hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {t({ en: 'Next', bm: 'Seterusnya' })} →
                                    </button>

                                    <button
                                        onClick={handleShuffle}
                                        className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition ${
                                            isShuffle
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                                        }`}
                                    >
                                        {t({
                                            en: isShuffle ? '🔀 Shuffled' : '🔀 Shuffle',
                                            bm: isShuffle ? '🔀 Dikocok' : '🔀 Kocok'
                                        })}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/95 rounded-lg shadow-lg p-12 text-center">
                                <p className="text-lg text-gray-600 mb-4">
                                    {t({
                                        en: 'No learning materials available in this category.',
                                        bm: 'Tiada bahan pembelajaran tersedia dalam kategori ini.'
                                    })}
                                </p>
                                <button
                                    onClick={() => handleCategoryChange(null)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    {t({
                                        en: 'View All Categories',
                                        bm: 'Lihat Semua Kategori'
                                    })}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            {/* End Static Background Wrapper */}
        </TanganakDusunLayout>
    );
}
