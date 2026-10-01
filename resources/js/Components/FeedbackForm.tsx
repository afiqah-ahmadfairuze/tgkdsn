import { useState, FormEvent } from 'react';
import axios from 'axios';
import { useLanguage } from '@/Contexts/LanguageContext';

interface FeedbackFormProps {
    onClose: () => void;
}

/*
 * Feedback form modal for collecting user experience data
 * Supports bilingual questions (English and Bahasa Malaysia)
 */
export default function FeedbackForm({ onClose }: FeedbackFormProps) {
    const { language } = useLanguage();
    const [easeOfUse, setEaseOfUse] = useState('');
    const [learnedWords, setLearnedWords] = useState('');
    const [quizFun, setQuizFun] = useState('');
    const [virtualTour, setVirtualTour] = useState('');
    const [favouritePart, setFavouritePart] = useState('');
    const [improvements, setImprovements] = useState('');
    const [issueReported, setIssueReported] = useState(false);
    const [issueType, setIssueType] = useState('');
    const [issueDetails, setIssueDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const questions = {
        en: {
            ease: { title: 'Was this website easy to use?', options: ['Yes!', 'Okay', 'Hard'] },
            words: { title: 'Did you learn new Dusun words today?', options: ['Yes!', 'A little', 'No'] },
            quiz: { title: 'Were the quizzes fun?', options: ['Yes!', 'Kind of', 'No'] },
            tour: { title: 'Did you enjoy the virtual tour?', options: ['Yes!', 'It was okay', 'Not really'] },
            favourite: { title: 'What was your favourite part?', placeholder: 'Short answer' },
            improvements: { title: 'What should we improve?', placeholder: 'Short answer' },
            issue: {
                title: 'Did you face any problems while using the website?',
                options: [
                    'The games/quizzes didn\'t work',
                    'The sound/audio didn\'t play',
                    'Words or stories didn\'t load',
                    'Pictures/images didn\'t show',
                    'Website was too slow',
                    'I couldn\'t log in',
                    'I didn\'t understand something',
                    'Something else',
                ],
                details: { title: 'Tell us more (if you want):', placeholder: 'Short answer' },
            },
        },
        bm: {
            ease: { title: 'Adakah laman web ini senang digunakan?', options: ['Ya!', 'Boleh lah', 'Susah'] },
            words: { title: 'Adakah kamu belajar perkataan Dusun baharu hari ini?', options: ['Ya!', 'Sedikit', 'Tidak'] },
            quiz: { title: 'Adakah kuiz itu menyeronokkan?', options: ['Ya!', 'Boleh lah', 'Tidak'] },
            tour: { title: 'Adakah kamu seronok dengan lawatan maya?', options: ['Ya!', 'Biasa saja', 'Tidak sangat'] },
            favourite: { title: 'Bahagian mana yang kamu paling suka?', placeholder: 'Jawapan ringkas' },
            improvements: { title: 'Apa yang patut kami baiki?', placeholder: 'Jawapan ringkas' },
            issue: {
                title: 'Adakah kamu menghadapi sebarang masalah semasa menggunakan laman web?',
                options: [
                    'Permainan/kuiz tidak berfungsi',
                    'Bunyi/audio tidak dimainkan',
                    'Perkataan atau cerita tidak dimuat',
                    'Gambar/imej tidak ditunjukkan',
                    'Laman web terlalu perlahan',
                    'Saya tidak dapat log masuk',
                    'Saya tidak memahami sesuatu',
                    'Sesuatu yang lain',
                ],
                details: { title: 'Beritahu kami lagi (jika mahu):', placeholder: 'Jawapan ringkas' },
            },
        },
    };

    const q = questions[language];

    /* Validates required fields and submits feedback data to the server */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!easeOfUse || !learnedWords || !quizFun || !virtualTour) {
            setError(language === 'en' ? 'Please answer all required questions' : 'Sila jawab semua soalan yang diperlukan');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(route('feedback.store'), {
                language,
                ease_of_use: easeOfUse,
                learned_words: learnedWords,
                quiz_fun: quizFun,
                virtual_tour: virtualTour,
                favourite_part: favouritePart,
                improvements,
                issue_reported: issueReported,
                issue_type: issueReported ? issueType : null,
                issue_details: issueReported ? issueDetails : null,
            });

            if (response.data.success) {
                alert(response.data.message || (language === 'en' ? 'Feedback submitted successfully!' : 'Maklum balas telah dihantar dengan berjaya!'));
                onClose();
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || (language === 'en' ? 'Error submitting feedback' : 'Ralat menghantar maklum balas');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {language === 'en' ? 'Feedback & Review' : 'Maklum Balas & Ulasan'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

                    {/* Question 1: Ease of Use */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            {q.ease.title} <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            {q.ease.options.map((option) => (
                                <label key={option} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="ease_of_use"
                                        value={option}
                                        checked={easeOfUse === option}
                                        onChange={(e) => setEaseOfUse(e.target.value)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Question 2: Learned Words */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            {q.words.title} <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            {q.words.options.map((option) => (
                                <label key={option} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="learned_words"
                                        value={option}
                                        checked={learnedWords === option}
                                        onChange={(e) => setLearnedWords(e.target.value)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Question 3: Quiz Fun */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            {q.quiz.title} <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            {q.quiz.options.map((option) => (
                                <label key={option} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="quiz_fun"
                                        value={option}
                                        checked={quizFun === option}
                                        onChange={(e) => setQuizFun(e.target.value)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Question 4: Virtual Tour */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            {q.tour.title} <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            {q.tour.options.map((option) => (
                                <label key={option} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="virtual_tour"
                                        value={option}
                                        checked={virtualTour === option}
                                        onChange={(e) => setVirtualTour(e.target.value)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Question 5: Favourite Part */}
                    <div>
                        <label htmlFor="favourite" className="block text-sm font-medium text-gray-900 mb-2">
                            {q.favourite.title}
                        </label>
                        <textarea
                            id="favourite"
                            value={favouritePart}
                            onChange={(e) => setFavouritePart(e.target.value)}
                            placeholder={q.favourite.placeholder}
                            maxLength={500}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">{favouritePart.length}/500</p>
                    </div>

                    {/* Question 6: Improvements */}
                    <div>
                        <label htmlFor="improvements" className="block text-sm font-medium text-gray-900 mb-2">
                            {q.improvements.title}
                        </label>
                        <textarea
                            id="improvements"
                            value={improvements}
                            onChange={(e) => setImprovements(e.target.value)}
                            placeholder={q.improvements.placeholder}
                            maxLength={500}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">{improvements.length}/500</p>
                    </div>

                    {/* Divider and Question 7: Issue Reporting (Optional) */}
                    <div className="border-t-2 border-gray-200 pt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                {language === 'en' ? 'Did you face any problems while using the website?' : 'Adakah kamu menghadapi sebarang masalah semasa menggunakan laman web?'}
                            </label>
                            <div className="space-y-2">
                                {q.issue.options.map((option) => (
                                    <label key={option} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="issue_type"
                                            value={option}
                                            checked={issueType === option}
                                            onChange={(e) => {
                                                setIssueReported(true);
                                                setIssueType(e.target.value);
                                            }}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{option}</span>
                                    </label>
                                ))}
                                {/* No issue option */}
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="issue_type"
                                        value=""
                                        checked={issueType === ''}
                                        onChange={() => {
                                            setIssueReported(false);
                                            setIssueType('');
                                            setIssueDetails('');
                                        }}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{language === 'en' ? 'No problems' : 'Tiada masalah'}</span>
                                </label>
                            </div>
                        </div>

                        {/* Optional follow-up for issue details */}
                        {issueReported && issueType && (
                            <div className="mt-4">
                                <label htmlFor="issue_details" className="block text-sm font-medium text-gray-900 mb-2">
                                    {q.issue.details.title}
                                </label>
                                <textarea
                                    id="issue_details"
                                    value={issueDetails}
                                    onChange={(e) => setIssueDetails(e.target.value)}
                                    placeholder={q.issue.details.placeholder}
                                    maxLength={500}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">{issueDetails.length}/500</p>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                        >
                            {language === 'en' ? 'Cancel' : 'Batal'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-50"
                        >
                            {loading ? (language === 'en' ? 'Submitting...' : 'Menghantar...') : (language === 'en' ? 'Submit Feedback' : 'Hantar Maklum Balas')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
