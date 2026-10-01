import { useEffect, useState } from 'react';
import TanganakDusunLayout from '@/Layouts/TanganakDusunLayout';
import { useLanguage } from '@/Contexts/LanguageContext';
import { PageProps } from '@/types';
import LearningMaterialCard from '@/Components/LearningMaterialCard';
import LearningMaterialPreviewModal from '@/Components/LearningMaterialPreviewModal';
import axios from 'axios';

interface Flashcard {
    id: number;
    material_id: number;
    word: string;
    description: string;
    image: string | null;
}

interface LearningMaterial {
    id: number;
    title: string;
    description: string | null;
    category: string | null;
    cover_image?: string | null;
    flashcards: Flashcard[];
}

interface LearningCategory {
    id: number;
    name: string;
}

interface LearningMaterialsData {
    categories: LearningCategory[];
    materials: LearningMaterial[];
}

export default function DusLearn({ auth }: PageProps) {
    const { t } = useLanguage();
    const [materials, setMaterials] = useState<LearningMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);

    const backgroundStyle = {
        backgroundImage: 'url(/images/Hero.jpg)',
        backgroundAttachment: 'fixed' as const,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    };

    useEffect(() => {
        fetchLearningData();
    }, []);

    const fetchLearningData = async () => {
        try {
            const response = await axios.get(route('learning-materials.public'));
            setMaterials(response.data.materials);
        } catch (error) {
            console.error('Error fetching learning materials:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter materials by search query and category
    const filteredMaterials = materials.filter((material) => {
        const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

        const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Get unique categories from materials
    const uniqueCategories = Array.from(new Set(materials.map(m => m.category).filter(Boolean)));

    // Handle opening preview modal
    const handleOpenPreview = (materialId: number) => {
        const material = materials.find(m => m.id === materialId);
        if (material) {
            setSelectedMaterial(material);
            setShowPreviewModal(true);
        }
    };

    // Handle closing preview modal
    const handleClosePreview = () => {
        setShowPreviewModal(false);
        setSelectedMaterial(null);
    };

    return (
        <TanganakDusunLayout auth={auth} title="DusLearn - Flashcards" backgroundStyle={backgroundStyle}>
            <div className="py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#10B981' }}>
                            {t({
                                en: 'DusLearn - Flashcards',
                                bm: 'DusLearn - Kad Imbas'
                            })}
                        </h1>
                        <p className="text-lg text-gray-700">
                            {t({
                                en: 'Learn Dusun like playing a game! Look at the cards, read the words, and learn simple sentences happily!',
                                bm: 'Belajar bahasa Dusun macam main permainan! Lihat kad, baca perkataan, dan belajar ayat mudah dengan gembira!'
                            })}
                        </p>
                    </div>

                    {/* Search and Filter Section */}
                    {!loading && materials.length > 0 && (
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
                                            en: 'Search learning materials...',
                                            bm: 'Cari bahan pembelajaran...'
                                        })}
                                        className="w-full px-4 py-2 md:px-6 md:py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 transition text-sm md:text-base"
                                    />
                                </div>

                                {/* Category Filter Dropdown */}
                                <div className="md:w-48">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-4 py-2 md:px-6 md:py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-900 focus:outline-none focus:border-green-500 transition appearance-none cursor-pointer font-semibold text-sm md:text-base"
                                    >
                                        <option value="all">{t({ en: 'All Categories', bm: 'Semua Kategori' })}</option>
                                        {uniqueCategories.map((category) => (
                                            <option key={category} value={category || ''}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Learning Materials Section */}
                    {loading ? (
                        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center py-12">
                            <p className="text-lg text-gray-700">{t({ en: 'Loading learning materials...', bm: 'Memuatkan bahan pembelajaran...' })}</p>
                        </div>
                    ) : materials.length > 0 ? (
                        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-8 md:p-12">
                            <h2 className="text-2xl font-bold mb-8 text-white">
                                {t({ en: 'Learning Materials', bm: 'Bahan Pembelajaran' })} ({filteredMaterials.length})
                            </h2>
                            {filteredMaterials.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                                            {filteredMaterials.map((material) => (
                                                <LearningMaterialCard
                                                    key={material.id}
                                                    id={material.id}
                                                    title={material.title}
                                                    description={material.description}
                                                    category={material.category}
                                                    flashcardCount={material.flashcards?.length || 0}
                                                    cover_image={material.cover_image}
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
                                            en: 'No materials match your search criteria.',
                                            bm: 'Tiada bahan yang sepadan dengan kriteria carian anda.'
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
                                    en: 'No learning materials available yet.',
                                    bm: 'Tiada bahan pembelajaran tersedia lagi.'
                                })}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Learning Material Preview Modal */}
            {selectedMaterial && (
                <LearningMaterialPreviewModal
                    isOpen={showPreviewModal}
                    materialId={selectedMaterial.id}
                    title={selectedMaterial.title}
                    description={selectedMaterial.description}
                    category={selectedMaterial.category}
                    flashcardCount={selectedMaterial.flashcards?.length || 0}
                    coverImage={selectedMaterial.cover_image}
                    onClose={handleClosePreview}
                />
            )}
        </TanganakDusunLayout>
    );
}
