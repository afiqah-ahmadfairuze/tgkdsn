import { useEffect, useState } from 'react';
import { useLanguage } from '@/Contexts/LanguageContext';
import axios from 'axios';

interface LeaderboardEntry {
    rank: number;
    user_id: string;
    name: string;
    profile_picture: string | null;
    total_marks: number;
    total_quizzes: number;
}

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/*
 * Full-screen modal displaying the quiz leaderboard rankings
 * Shows user rankings with profile pictures and scores
 */
export default function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
    const { t } = useLanguage();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLeaderboard();
        }
    }, [isOpen]);

    /* Fetches the leaderboard data from the API */
    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/quiz/leaderboard');
            setLeaderboard(response.data.leaderboard);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    /* Returns styling for rank badges (gold, silver, bronze for top 3) */
    const getRankStyles = (rank: number) => {
        const styles = {
            1: {
                bg: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                textColor: 'text-gray-900',
                shadow: 'shadow-lg shadow-yellow-400/50'
            },
            2: {
                bg: 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)',
                textColor: 'text-gray-900',
                shadow: 'shadow-lg shadow-gray-400/50'
            },
            3: {
                bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                textColor: 'text-white',
                shadow: 'shadow-lg shadow-orange-400/50'
            },
        };
        return styles[rank as keyof typeof styles] || {
            bg: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
            textColor: 'text-white',
            shadow: 'shadow-md shadow-blue-400/50'
        };
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="rounded-2xl overflow-hidden max-w-4xl w-full max-h-[85vh] flex flex-col bg-white/40 backdrop-blur-md border-2 border-white/50 shadow-xl">
                {/* Decorative Header Banner */}
                <div className="relative pt-8 pb-6">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 z-10"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Banner */}
                    <div className="relative mx-auto w-4/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 transform -skew-y-1 rounded-lg shadow-xl"></div>
                        <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 py-3 px-6 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-black text-white text-center tracking-wider uppercase">
                                {t({ en: 'Full Leaderboard', bm: 'Papan Pendahulu Penuh' })}
                            </h3>
                        </div>
                        {/* Decorative ribbon ends */}
                        <div className="absolute -left-3 top-0 w-0 h-0 border-t-[20px] border-t-transparent border-r-[20px] border-r-yellow-600 border-b-[20px] border-b-transparent"></div>
                        <div className="absolute -right-3 top-0 w-0 h-0 border-t-[20px] border-t-transparent border-l-[20px] border-l-yellow-600 border-b-[20px] border-b-transparent"></div>
                    </div>
                </div>

                {/* Leaderboard List */}
                <div className="px-6 flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="text-center text-gray-700 py-8">
                            {t({ en: 'Loading...', bm: 'Sedang memuat...' })}
                        </div>
                    ) : leaderboard.length > 0 ? (
                        <div className="space-y-3 pb-4">
                            {leaderboard.map((entry) => {
                                const rankStyle = getRankStyles(entry.rank);
                                return (
                                    <div
                                        key={entry.user_id}
                                        className={`rounded-2xl p-4 transform transition-all duration-200 hover:scale-[1.02] ${rankStyle.shadow}`}
                                        style={{ background: rankStyle.bg }}
                                    >
                                        <div className="flex items-center space-x-4">
                                            {/* Rank Number */}
                                            <div className="text-3xl font-black text-white opacity-80 min-w-[35px]">
                                                {entry.rank}
                                            </div>

                                            {/* Profile Picture */}
                                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-white border-3 border-white shadow-md">
                                                {entry.profile_picture ? (
                                                    <img
                                                        src={entry.profile_picture}
                                                        alt={entry.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Username */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-base text-white truncate uppercase tracking-wide">
                                                    {entry.name}
                                                </p>
                                            </div>

                                            {/* Score with Green Check Circle Icon */}
                                            <div className="flex items-center space-x-2 bg-white/90 rounded-full px-3 py-1.5 shadow-md">
                                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-black text-base text-gray-900">
                                                    {entry.total_marks.toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Quiz Count Badge */}
                                            <div className="flex items-center space-x-1.5 bg-white/90 rounded-full px-3 py-1.5 shadow-md">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <span className="font-bold text-sm text-gray-900">
                                                    {entry.total_quizzes}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-gray-700 py-8">
                            {t({ en: 'No users in leaderboard yet', bm: 'Tiada pengguna dalam papan pendahulu lagi' })}
                        </div>
                    )}
                </div>

                {/* Close Button Footer */}
                <div className="px-6 pb-6 pt-2">
                    <button
                        onClick={onClose}
                        className="block w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-black rounded-xl transition duration-200 text-center shadow-lg hover:shadow-xl transform hover:scale-105 uppercase tracking-wide"
                    >
                        {t({ en: 'Close', bm: 'Tutup' })}
                    </button>
                </div>
            </div>
        </div>
    );
}
