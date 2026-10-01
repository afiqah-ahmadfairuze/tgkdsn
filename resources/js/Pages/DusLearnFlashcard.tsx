import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import axios from 'axios';

interface Flashcard {
    id: number;
    material_id: number;
    word: string;
    description: string;
    description_eng: string;
    image: string | null;
}

interface LearningMaterial {
    id: number;
    title: string;
    description: string | null;
    category: string | null;
    flashcards: Flashcard[];
}

interface DusLearnFlashcardProps extends PageProps {
    readonly materialId: string;
}

export default function DusLearnFlashcard({ materialId }: DusLearnFlashcardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [material, setMaterial] = useState<LearningMaterial | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [hasFlippedCurrentCard, setHasFlippedCurrentCard] = useState(false);

    const backgroundStyle = {
        backgroundImage: 'url(/images/Hero.jpg)',
        backgroundAttachment: 'fixed' as const,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    };

    useEffect(() => {
        fetchMaterial();
    }, [materialId]);

    const fetchMaterial = async () => {
        try {
            setLoading(true);
            const response = await axios.get(route('learning-materials.public'));
            const allMaterials = response.data.materials as LearningMaterial[];

            const materialId_num = parseInt(materialId, 10);
            const foundMaterial = allMaterials.find(m => m.id === materialId_num);

            if (!foundMaterial) {
                setError('Learning material not found');
                return;
            }

            if (!foundMaterial.flashcards || foundMaterial.flashcards.length === 0) {
                setError('No flashcards available in this material');
                return;
            }

            setMaterial(foundMaterial);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load learning material');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (material && currentIndex < material.flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
            setHasFlippedCurrentCard(false);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
            setHasFlippedCurrentCard(false);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (!isFlipped) {
            setHasFlippedCurrentCard(true);
        }
    };

    const handleBackClick = () => {
        setShowExitConfirm(true);
    };

    const handleConfirmExit = () => {
        router.visit('/learning-materials');
    };

    const handleCancelExit = () => {
        setShowExitConfirm(false);
    };

    const handleDone = async () => {
        if (!material) return;

        try {
            const response = await axios.post(`/api/learning-materials/${material.id}/complete`);

            if (response.data.success) {
                // Redirect to DusLearn page
                router.visit('/learning-materials');
            } else {
                alert('Failed to save progress. Please try again.');
            }
        } catch (error: any) {
            console.error('Error marking material as completed:', error);
            alert('An error occurred while saving your progress.');
        }
    };

    // Show loading state
    if (loading) {
        return (
            <>
                <Head title="DusLearn - Flashcards" />
                <div style={backgroundStyle} className="flex items-center justify-center min-h-screen">
                    <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
                        <p className="text-gray-600">Loading flashcards...</p>
                    </div>
                </div>
            </>
        );
    }

    // Show error state
    if (error || !material) {
        return (
            <>
                <Head title="DusLearn - Flashcards" />
                <div style={backgroundStyle} className="flex items-center justify-center min-h-screen">
                    <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
                        <p className="text-red-600 mb-4">{error || 'Material not found'}</p>
                        <button
                            onClick={() => router.visit('/learning-materials')}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Back to Learning Materials
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const currentFlashcard = material.flashcards[currentIndex];
    const progress = material.flashcards.length > 0 ? ((currentIndex + 1) / material.flashcards.length) * 100 : 0;

    return (
        <>
            <Head title={`${material.title} - TanganakDusun`} />

            {/* Static Background Wrapper - No TanganakDusunLayout */}
            <div style={backgroundStyle} className="flex items-center justify-center py-8 px-4 min-h-screen">
                {/* Flashcard Container */}
                <div className="w-full max-w-md">
                    {/* Material Header */}
                    <div className="bg-green-500 text-white p-6 rounded-t-lg mb-0">
                        <div className="flex items-center justify-between mb-2">
                            <button
                                onClick={handleBackClick}
                                className="text-white hover:text-gray-200 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="text-white font-semibold text-lg">
                                {currentIndex + 1}/{material.flashcards.length}
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-center">{material.title}</h1>
                        {material.description && (
                            <p className="text-center text-sm mt-2 opacity-90">{material.description}</p>
                        )}
                    </div>

                    {/* Main Flashcard Container */}
                    <div className="bg-white rounded-b-lg shadow-xl overflow-hidden">
                        {/* Progress Bar */}
                        <div className="h-2 bg-gray-200">
                            <div
                                className="h-full bg-pink-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Flashcard Content */}
                        <div className="p-8">
                            {/* Card Counter */}
                            <p className="text-sm text-gray-500 mb-4">
                                Card {currentIndex + 1} of {material.flashcards.length}
                            </p>

                            {/* 3D Flashcard */}
                            <div
                                onClick={handleFlip}
                                className="perspective cursor-pointer mb-8"
                                style={{ height: '320px' }}
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
                                        className="absolute w-full h-full bg-green-500 rounded-lg shadow-2xl flex items-center justify-center text-white"
                                        style={{ backfaceVisibility: 'hidden', padding: '1cm' }}
                                    >
                                        <div className="w-full h-full flex items-center justify-center">
                                            {currentFlashcard.image ? (
                                                <img
                                                    src={currentFlashcard.image}
                                                    alt="Flashcard"
                                                    className="w-full h-full object-contain rounded-lg"
                                                    style={{ aspectRatio: '1/1' }}
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-lg opacity-75">No image available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Back of Card - Word and Description */}
                                    <div
                                        className="absolute w-full h-full bg-green-500 rounded-lg shadow-2xl flex flex-col items-center justify-center text-white"
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)',
                                            padding: '1cm'
                                        }}
                                    >
                                        <div className="text-center">
                                            <h2 className="text-4xl font-bold mb-4">{currentFlashcard.word}</h2>
                                            <hr className="my-3 border-white/30" />
                                            <p className="text-xl font-bold">{currentFlashcard.description}</p>
                                            {currentFlashcard.description_eng && currentFlashcard.description_eng.trim() !== '' && (
                                                <p className="text-base italic mt-2">{currentFlashcard.description_eng}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Flip Instruction */}
                            <p className="text-center text-sm text-gray-500 mb-6">
                                Click card to flip
                            </p>

                            {/* Navigation Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentIndex === 0}
                                    className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg font-medium hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    ← Previous
                                </button>

                                {currentIndex === material.flashcards.length - 1 ? (
                                    <button
                                        onClick={handleDone}
                                        disabled={!hasFlippedCurrentCard}
                                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        ✓ Done
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        disabled={!hasFlippedCurrentCard}
                                        className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Next →
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exit Confirmation Modal */}
                {showExitConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Exit Learning Mode?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to exit? Your progress will not be saved.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={handleCancelExit}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmExit}
                                    className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                                >
                                    Exit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
