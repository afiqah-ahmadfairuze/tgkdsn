import { useEffect, useState } from 'react';
import TanganakDusunLayout from '@/Layouts/TanganakDusunLayout';
import { useLanguage } from '@/Contexts/LanguageContext';
import { PageProps } from '@/types';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';

interface QuizQuestion {
    id: number;
    question_bm: string;
    question_eng: string;
    options: string[];
    correctAnswer: string;
    marks: number;
    image?: string | null;
}

interface QuizInfo {
    id: number;
    title: string;
    description: string;
    total_marks: number;
}

interface QuizDetailProps extends PageProps {
    quizId: string;
}

export default function QuizDetail({ auth, quizId }: QuizDetailProps) {
    const { t } = useLanguage();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);
    const [difficulty, setDifficulty] = useState('Beginner');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userAnswers, setUserAnswers] = useState<Map<number, string>>(new Map());
    const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
    const [timerActive, setTimerActive] = useState(false);

    const backgroundStyle = {
        backgroundImage: 'url(/images/Hero.jpg)',
        backgroundAttachment: 'fixed' as const,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    };

    // Fetch quiz questions on mount
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/quiz/${quizId}/questions`);
                setQuizInfo(response.data.quiz);
                setQuestions(response.data.questions);
                setError(null);
                setTimerActive(true); // Start timer when questions are loaded
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load quiz questions');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [quizId]);

    // Timer logic - 60 seconds per question
    useEffect(() => {
        if (!timerActive || loading) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Time's up! Auto-advance to next question
                    if (currentQuestion < questions.length - 1) {
                        // Move to next question
                        setCurrentQuestion((curr) => curr + 1);
                        setSelectedAnswer(null);
                        setAnswered(false);
                        return 30; // Reset timer for next question
                    } else {
                        // Last question - auto submit
                        setTimerActive(false);
                        handleSubmit();
                        return 0;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timerActive, loading, currentQuestion, questions.length]);

    // Reset timer when manually moving to next question
    useEffect(() => {
        if (!loading && questions.length > 0) {
            setTimeLeft(30);
        }
    }, [currentQuestion]);

    const handleAnswerClick = (option: string) => {
        if (answered) return;

        // Convert option text to letter (A, B, C, D)
        const optionIndex = question.options.indexOf(option);
        const answerLetter = String.fromCharCode(65 + optionIndex); // 65 is ASCII for 'A'

        setSelectedAnswer(option);
        setAnswered(true);

        // Store the answer as letter (A, B, C, D) for backend
        const newAnswers = new Map(userAnswers);
        newAnswers.set(questions[currentQuestion].id, answerLetter);
        setUserAnswers(newAnswers);

        // Calculate score for immediate feedback
        if (answerLetter === questions[currentQuestion].correctAnswer) {
            setScore(score + questions[currentQuestion].marks);
        }
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setAnswered(false);
        }
    };

    const handleBack = () => {
        const confirmed = window.confirm(
            t({
                en: 'Are you sure you want to exit the quiz? Your progress will not be saved.',
                bm: 'Adakah anda pasti ingin keluar dari kuiz? Kemajuan anda tidak akan disimpan.'
            })
        );
        if (confirmed) {
            router.visit('/quiz');
        }
    };

    const handleSubmit = async () => {
        // Transform answers to match API format
        const answers = Array.from(userAnswers.entries()).map(([questionId, answer]) => ({
            question_id: questionId,
            answer: answer,
        }));

        try {
            const response = await axios.post(`/api/quiz/${quizId}/submit`, { answers });

            // Check if submission was successful
            if (response.data.success) {
                // Extract attempt_id from the response
                const attemptId = response.data.attempt_id;
                if (attemptId) {
                    alert(response.data.message || 'Quiz submitted successfully!');
                    window.location.href = `/quiz-results/${attemptId}`;
                } else {
                    alert('Error: Could not get attempt ID. Please refresh the page.');
                }
            } else {
                alert('Error submitting quiz. Please try again.');
            }
        } catch (error: any) {
            console.error('Error submitting quiz:', error);
            const errorMessage = error.response?.data?.message || 'Error submitting quiz. Please try again.';
            alert(errorMessage);
        }
    };

    const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
    const question = questions[currentQuestion];

    // Get the letter of the selected answer
    const selectedAnswerLetter = selectedAnswer && question ? String.fromCharCode(65 + question.options.indexOf(selectedAnswer)) : null;
    const isAnsweredCorrectly = selectedAnswerLetter === question?.correctAnswer;

    // Get the correct option text and letter for display
    const correctAnswerLetter = question?.correctAnswer || '';
    const correctOptionIndex = correctAnswerLetter ? correctAnswerLetter.charCodeAt(0) - 65 : -1;
    const correctOptionText = question && correctOptionIndex >= 0 ? question.options[correctOptionIndex] : null;

    // Show loading state
    if (loading) {
        return (
            <TanganakDusunLayout auth={auth} title="Quiz - TanganakDusun" backgroundStyle={backgroundStyle} hideNavigation={true} hideFooter={true}>
                <div className="flex items-center justify-center py-8 px-4 min-h-screen">
                    <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
                        <p className="text-gray-600">{t({ en: 'Loading quiz...', bm: 'Sedang memuatkan kuiz...' })}</p>
                    </div>
                </div>
            </TanganakDusunLayout>
        );
    }

    // Show error state
    if (error || questions.length === 0) {
        return (
            <TanganakDusunLayout auth={auth} title="Quiz - TanganakDusun" backgroundStyle={backgroundStyle} hideNavigation={true} hideFooter={true}>
                <div className="flex items-center justify-center py-8 px-4 min-h-screen">
                    <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
                        <p className="text-red-600 mb-4">{error || t({ en: 'No questions available', bm: 'Tiada soalan tersedia' })}</p>
                        <Link href="/quiz" className="text-blue-600 hover:text-blue-800">
                            {t({ en: 'Back to Quizzes', bm: 'Kembali ke Kuiz' })}
                        </Link>
                    </div>
                </div>
            </TanganakDusunLayout>
        );
    }

    return (
        <TanganakDusunLayout auth={auth} title={`${quizInfo?.title || 'Quiz'} - TanganakDusun`} backgroundStyle={backgroundStyle} hideNavigation={true} hideFooter={true}>
            {/* Static Background Wrapper */}
            <div
                className="flex items-center justify-center py-8 px-4 min-h-screen"
            >
                {/* Quiz Container */}
                <div className="w-full max-w-md">
                    {/* Quiz Title Header */}
                    <div className="text-white p-6 rounded-t-lg mb-0" style={{ backgroundColor: '#FBBF24' }}>
                        <div className="flex items-center justify-between mb-2">
                            <button
                                onClick={handleBack}
                                className="text-white hover:text-gray-200 transition"
                                title={t({ en: 'Exit Quiz', bm: 'Keluar dari Kuiz' })}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="flex items-center gap-4">
                                {/* Timer Display */}
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                                    timeLeft <= 10 ? 'bg-red-500 animate-pulse' : 'bg-white bg-opacity-20'
                                }`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-bold">
                                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                                {/* Next Button */}
                                <button
                                    onClick={currentQuestion === questions.length - 1 ? handleSubmit : handleNext}
                                    disabled={!answered}
                                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                        !answered
                                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                            : 'text-white cursor-pointer hover:opacity-90'
                                    }`}
                                    style={answered ? { backgroundColor: '#22C55E' } : {}}
                                >
                                    {currentQuestion === questions.length - 1
                                        ? t({ en: 'Submit', bm: 'Hantar' })
                                        : t({ en: 'Next', bm: 'Seterusnya' })
                                    }
                                </button>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-center">{quizInfo?.title}</h1>
                    </div>

                    {/* Main Quiz Card */}
                    <div className="bg-white rounded-b-lg shadow-xl overflow-hidden transform animate-fadeIn">
                        {/* Progress Bar */}
                        <div className="h-2 bg-gray-200">
                            <div
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Quiz Content */}
                        <div className="p-8">
                            {/* Question Number */}
                            <p className="text-sm text-gray-500 mb-4">
                                {t({ en: 'Question', bm: 'Soalan' })} {currentQuestion + 1} {t({ en: 'of', bm: 'daripada' })} {questions.length}
                            </p>

                            {/* Question Image - Optional */}
                            {question.image && (
                                <div className="mb-4 rounded-lg overflow-hidden bg-white border-2 border-gray-200 flex items-center justify-center p-2">
                                    <img
                                        src={question.image}
                                        alt="Question"
                                        className="w-48 h-48 object-contain"
                                        onError={(e) => {
                                            console.error('Failed to load image:', question.image);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Question with Marks */}
                            <div className="mb-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 pr-2">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                            {question.question_bm}
                                        </h2>
                                        <p className="text-base text-gray-600 italic">
                                            {question.question_eng}
                                        </p>
                                    </div>
                                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ml-2">
                                        {question.marks} {t({ en: 'mark', bm: 'markah' })}
                                    </span>
                                </div>
                            </div>

                            {/* Answer Options */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {question.options.map((option, index) => {
                                    const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                                    const isThisOptionCorrect = optionLetter === question.correctAnswer;
                                    const isThisOptionSelected = selectedAnswer === option;

                                    // Define colors for each option button
                                    const buttonColors = [
                                        { bg: '#EF4444', hover: '#DC2626' }, // Red for A
                                        { bg: '#F97316', hover: '#EA580C' }, // Orange for B
                                        { bg: '#22C55E', hover: '#16A34A' }, // Green for C
                                        { bg: '#3B82F6', hover: '#2563EB' }  // Blue for D
                                    ];

                                    const getButtonStyle = () => {
                                        if (answered) {
                                            // Show correct answer in green
                                            if (isThisOptionCorrect) {
                                                return { backgroundColor: '#22C55E' }; // Green for correct answer
                                            }
                                            // Show all wrong answers in gray
                                            return { backgroundColor: '#9CA3AF' }; // Gray for wrong answers
                                        }
                                        // Before answering, show original colors
                                        return { backgroundColor: buttonColors[index].bg };
                                    };

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerClick(option)}
                                            disabled={answered}
                                            style={getButtonStyle()}
                                            className={`w-full p-4 rounded-lg text-left font-medium transition-all duration-200 text-white ${
                                                answered ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-90'
                                            }`}
                                        >
                                            <span className="font-bold mr-2">{optionLetter}.</span>
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback */}
                            {answered && (
                                <div className={`p-4 rounded-lg font-medium ${
                                    isAnsweredCorrectly
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {isAnsweredCorrectly
                                        ? t({ en: 'Correct! Well done!', bm: 'Betul! Bagus!' })
                                        : (
                                            <div>
                                                <p className="mb-2">{t({ en: 'Incorrect!', bm: 'Salah!' })}</p>
                                                <p className="text-sm">
                                                    {t({ en: 'Correct answer:', bm: 'Jawapan yang betul:' })} <span className="font-bold">{correctAnswerLetter}. {correctOptionText}</span>
                                                </p>
                                            </div>
                                        )
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TanganakDusunLayout>
    );
}
