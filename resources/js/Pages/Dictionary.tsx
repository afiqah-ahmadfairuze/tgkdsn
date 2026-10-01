import { useEffect, useState } from 'react';
import TanganakDusunLayout from '@/Layouts/TanganakDusunLayout';
import { useLanguage } from '@/Contexts/LanguageContext';
import { PageProps } from '@/types';
import axios from 'axios';

interface DictionaryEntry {
    entry_id: string;
    word: string;
    pronunciation?: string;
    example_sentence?: string;
    example_translation?: string;
    word_picture?: string;
}

const AVAILABLE_LANGUAGES = ['Dusun', 'Bahasa Melayu', 'English'];

/*
 * BorosBank dictionary page for Dusun word translations
 * Supports search between Dusun, Bahasa Melayu, and English
 */
export default function Dictionary({ auth }: PageProps) {
    const { t } = useLanguage();
    const [sourceLanguage, setSourceLanguage] = useState('Bahasa Melayu');
    const [targetLanguage, setTargetLanguage] = useState('Dusun');
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<DictionaryEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const backgroundStyle = {
        backgroundImage: 'url(/images/Hero.jpg)',
        backgroundAttachment: 'fixed' as const,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    };

    /* Searches the dictionary API with the selected languages */
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchQuery.trim() || !sourceLanguage || !targetLanguage) {
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get('/api/dictionary/search', {
                params: {
                    q: searchQuery,
                    source_language: sourceLanguage,
                    target_language: targetLanguage,
                },
            });

            setResults(response.data.results);
            setSearched(true);
        } catch (error) {
            console.error('Error searching dictionary:', error);
            setResults([]);
            setSearched(true);
        } finally {
            setLoading(false);
        }
    };

    /* Swaps source and target languages */
    const handleSwapLanguages = () => {
        const temp = sourceLanguage;
        setSourceLanguage(targetLanguage);
        setTargetLanguage(temp);
        setResults([]);
        setSearched(false);
    };

    return (
        <TanganakDusunLayout auth={auth} title="Dictionary - TanganakDusun" backgroundStyle={backgroundStyle}>
            <div className="py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#3B82F6' }}>
                            {t({ en: 'BorosBank - Dusun Dictionary', bm: 'BorosBank - Kamus Dusun' })}
                        </h1>
                        <p className="text-lg text-gray-700">
                            {t({
                                en: 'Wondering what a Dusun word means? Open BorosBank and find the meaning quickly and easily!',
                                bm: 'Tertanya-tanya maksud perkataan Dusun? Buka BorosBank dan cari maksudnya dengan cepat dan senang!'
                            })}
                        </p>
                    </div>

                    {/* Card 1: Language Selection & Search Form */}
                    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-8">
                        <h2 className="text-xl font-black mb-6 text-gray-900">
                            {t({ en: 'Select Translation Direction', bm: 'Pilih Arah Terjemahan' })}
                        </h2>

                        {/* Row 1: Language Selectors with Swap - Horizontal */}
                        <div className="flex flex-row items-end gap-2 md:gap-3 mb-6">
                            {/* Source Language Dropdown */}
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-2 text-gray-900">
                                    {t({ en: 'From:', bm: 'Dari:' })}
                                </label>
                                <select
                                    value={sourceLanguage}
                                    onChange={(e) => {
                                        setSourceLanguage(e.target.value);
                                        setResults([]);
                                        setSearched(false);
                                    }}
                                    className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer font-semibold text-sm md:text-base"
                                >
                                    {AVAILABLE_LANGUAGES.map((lang) => (
                                        <option key={lang} value={lang} className="text-gray-900">
                                            {lang}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Swap Button */}
                            <button
                                onClick={handleSwapLanguages}
                                className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-3 md:py-3 md:px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex items-center justify-center flex-shrink-0"
                                title={t({ en: 'Swap languages', bm: 'Tukar bahasa' })}
                            >
                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5m0 0l3 3m-3-3l3-3m8 10h3m0 0l-3-3m3 3l-3 3" />
                                </svg>
                            </button>

                            {/* Target Language Dropdown */}
                            <div className="flex-1">
                                <label className="block text-xs md:text-sm font-semibold mb-2 text-gray-900">
                                    {t({ en: 'To:', bm: 'Ke:' })}
                                </label>
                                <select
                                    value={targetLanguage}
                                    onChange={(e) => {
                                        setTargetLanguage(e.target.value);
                                        setResults([]);
                                        setSearched(false);
                                    }}
                                    className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer font-semibold text-sm md:text-base"
                                >
                                    {AVAILABLE_LANGUAGES.map((lang) => (
                                        <option key={lang} value={lang} className="text-gray-900">
                                            {lang}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Search Form */}
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 md:gap-3">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t({
                                    en: `Search in ${sourceLanguage}...`,
                                    bm: `Cari dalam ${sourceLanguage}...`
                                })}
                                className="w-full md:flex-1 px-4 py-3 md:px-6 md:py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition text-sm md:text-base"
                            />
                            <button
                                type="submit"
                                disabled={loading || !searchQuery.trim()}
                                className="w-full md:w-auto px-4 py-3 md:px-6 md:py-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md hover:shadow-xl transition duration-300 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {loading ? t({ en: 'Searching...', bm: 'Mencari...' }) : t({ en: 'Search', bm: 'Cari' })}
                            </button>
                        </form>
                    </div>

                    {/* Card 2: Results Display */}
                    <div className="rounded-xl shadow-lg p-8 md:p-12 mb-8 bg-white/20 backdrop-blur-sm border border-white/30">
                        {searched && (
                            <>
                                {loading ? (
                                    <div className="text-center py-12">
                                        <p className="text-lg text-gray-800 font-semibold">{t({ en: 'Searching...', bm: 'Mencari...' })}</p>
                                    </div>
                                ) : results.length > 0 ? (
                                    <>
                                        <div className="grid md:grid-cols-1 gap-8 max-w-4xl mx-auto">
                                            {results.map((entry) => (
                                                <div
                                                    key={entry.entry_id}
                                                    className="bg-white/80 backdrop-blur-md hover:bg-white/90 rounded-lg p-6 transition-all duration-200 border border-white/50 shadow-lg flex flex-col md:flex-row h-full gap-6"
                                                >
                                                    {/* Word Picture - Left Side */}
                                                    {entry.word_picture && (
                                                        <div className="flex-shrink-0 flex items-center justify-center">
                                                            <img
                                                                src={entry.word_picture}
                                                                alt={entry.word}
                                                                className="w-48 h-48 rounded-lg object-cover"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Content - Right Side */}
                                                    <div className="flex-1">
                                                        {/* Target Language Word */}
                                                        <div className="mb-6">
                                                            <h3 className="text-4xl font-bold text-blue-600 mb-2">
                                                                {entry.word}
                                                            </h3>
                                                        </div>

                                                        {/* Pronunciation */}
                                                        {entry.pronunciation && (
                                                            <div className="mb-4">
                                                                <p className="text-sm text-gray-700">
                                                                    <span className="font-medium">
                                                                        {t({ en: 'Pronunciation:', bm: 'Sebutan:' })}
                                                                    </span>
                                                                    {' '}
                                                                    <span className="italic text-gray-900 text-lg">{entry.pronunciation}</span>
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Source Language Example Sentence */}
                                                        {entry.example_sentence && (
                                                            <div className="bg-blue-50 rounded p-4 border-l-4 border-blue-400 mb-4">
                                                                <p className="text-sm font-semibold text-blue-700 mb-2">
                                                                    {t({ en: 'Sentence Example:', bm: 'Contoh Ayat:' })}
                                                                </p>
                                                                <p className="text-gray-800 italic text-base">"{entry.example_sentence}"</p>
                                                            </div>
                                                        )}

                                                        {/* Target Language Example Translation */}
                                                        {entry.example_translation && (
                                                            <div className="bg-pink-50 rounded p-4 border-l-4 border-pink-400">
                                                                <p className="text-sm font-semibold text-pink-700 mb-2">
                                                                    {t({ en: 'Sentence Translation:', bm: 'Terjemahan Ayat:' })}
                                                                </p>
                                                                <p className="text-gray-800 italic text-base">"{entry.example_translation}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-lg text-gray-800 font-semibold">
                                            {t({
                                                en: 'No results found. Try searching with different terms.',
                                                bm: 'Tiada hasil ditemui. Cuba mencari dengan istilah yang berbeza.'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Empty State - When not searched */}
                        {!searched && (
                            <div className="text-center py-12">
                                <svg className="w-20 h-20 mx-auto mb-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-2xl font-bold mb-3 text-white">
                                    {t({ en: 'Start Searching', bm: 'Mulai Mencari' })}
                                </h3>
                                <p className="text-lg text-white max-w-2xl mx-auto">
                                    {t({
                                        en: 'Select a translation direction and enter a word to search for definitions, pronunciations, and examples.',
                                        bm: 'Pilih arah terjemahan dan masukkan perkataan untuk mencari definisi, sebutan, dan contoh.'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>  {/* Close Max Width Container */}
            </div>  {/* Close Background Div */}
        </TanganakDusunLayout>
    );
}
