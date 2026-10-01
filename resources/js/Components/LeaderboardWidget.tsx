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

interface LeaderboardWidgetProps {
    onViewFullLeaderboard?: () => void;
}

/*
 * Compact leaderboard showing top 3 users in podium style
 * Auto-refreshes every 5 seconds for live updates
 */
export default function LeaderboardWidget({ onViewFullLeaderboard }: LeaderboardWidgetProps) {
    const { t } = useLanguage();
    const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
        // Refresh leaderboard every 5 seconds for live updates
        const interval = setInterval(fetchLeaderboard, 5000);
        return () => clearInterval(interval);
    }, []);

    /* Fetches leaderboard data and keeps only top 3 */
    const fetchLeaderboard = async () => {
        try {
            const response = await axios.get('/api/quiz/leaderboard');
            setTopUsers(response.data.leaderboard.slice(0, 3));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setLoading(false);
        }
    };

    /* Returns styling for rank badges (gold, silver, bronze) */
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

    return (
        <div className="rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md border-2 border-white/50 shadow-xl" style={{
            maxHeight: '520px'
        }}>
            {/* Decorative Header Banner */}
            <div className="relative pt-8 pb-6">
                {/* Banner */}
                <div className="relative mx-auto w-4/5">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 transform -skew-y-1 rounded-lg shadow-xl"></div>
                    <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 py-3 px-6 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-black text-white text-center tracking-wider uppercase">
                            {t({ en: 'Leaderboard', bm: 'Papan Pendahulu' })}
                        </h3>
                    </div>
                    {/* Decorative ribbon ends */}
                    <div className="absolute -left-3 top-0 w-0 h-0 border-t-[20px] border-t-transparent border-r-[20px] border-r-yellow-600 border-b-[20px] border-b-transparent"></div>
                    <div className="absolute -right-3 top-0 w-0 h-0 border-t-[20px] border-t-transparent border-l-[20px] border-l-yellow-600 border-b-[20px] border-b-transparent"></div>
                </div>
            </div>

            {/* Podium Display */}
            <div className="px-6 pb-6">
                {loading ? (
                    <div className="text-center text-gray-700 py-8">
                        {t({ en: 'Loading...', bm: 'Sedang memuat...' })}
                    </div>
                ) : topUsers.length > 0 ? (
                    <div className="flex items-end justify-center gap-4">
                        {/* 2nd Place - Left */}
                        {topUsers.find(u => u.rank === 2) && (() => {
                            const user = topUsers.find(u => u.rank === 2)!;
                            const rankStyle = getRankStyles(2);
                            return (
                                <div className="flex flex-col items-center" style={{ width: '120px' }}>
                                    <div className={`rounded-2xl p-4 w-full ${rankStyle.shadow}`} style={{ background: rankStyle.bg }}>
                                        <div className="flex flex-col items-center space-y-3">
                                            {/* Rank Number */}
                                            <div className="text-3xl font-black text-white opacity-80">
                                                2
                                            </div>

                                            {/* Profile Picture */}
                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-4 border-white shadow-md">
                                                {user.profile_picture ? (
                                                    <img
                                                        src={user.profile_picture}
                                                        alt="2nd place"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stats */}
                                            <div className="flex flex-col items-center space-y-2 w-full">
                                                {/* Total Marks */}
                                                <div className="flex items-center space-x-1 bg-white/90 rounded-full px-2 py-1 shadow-sm">
                                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-black text-xs text-gray-900">{user.total_marks}</span>
                                                </div>

                                                {/* Quiz Count */}
                                                <div className="flex items-center space-x-1 bg-white/90 rounded-full px-2 py-1 shadow-sm">
                                                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    <span className="font-black text-xs text-gray-900">{user.total_quizzes}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* 1st Place - Center (Taller) */}
                        {topUsers.find(u => u.rank === 1) && (() => {
                            const user = topUsers.find(u => u.rank === 1)!;
                            const rankStyle = getRankStyles(1);
                            return (
                                <div className="flex flex-col items-center" style={{ width: '140px' }}>
                                    <div className={`rounded-2xl p-5 w-full ${rankStyle.shadow}`} style={{ background: rankStyle.bg }}>
                                        <div className="flex flex-col items-center space-y-3">
                                            {/* Rank Number */}
                                            <div className="text-4xl font-black text-white opacity-80">
                                                1
                                            </div>

                                            {/* Profile Picture */}
                                            <div className="w-20 h-20 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg">
                                                {user.profile_picture ? (
                                                    <img
                                                        src={user.profile_picture}
                                                        alt="1st place"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stats */}
                                            <div className="flex flex-col items-center space-y-2 w-full">
                                                {/* Total Marks */}
                                                <div className="flex items-center space-x-1.5 bg-white/90 rounded-full px-3 py-1.5 shadow-md">
                                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-black text-sm text-gray-900">{user.total_marks}</span>
                                                </div>

                                                {/* Quiz Count */}
                                                <div className="flex items-center space-x-1.5 bg-white/90 rounded-full px-3 py-1.5 shadow-md">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    <span className="font-black text-sm text-gray-900">{user.total_quizzes}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* 3rd Place - Right */}
                        {topUsers.find(u => u.rank === 3) && (() => {
                            const user = topUsers.find(u => u.rank === 3)!;
                            const rankStyle = getRankStyles(3);
                            return (
                                <div className="flex flex-col items-center" style={{ width: '120px' }}>
                                    <div className={`rounded-2xl p-4 w-full ${rankStyle.shadow}`} style={{ background: rankStyle.bg }}>
                                        <div className="flex flex-col items-center space-y-3">
                                            {/* Rank Number */}
                                            <div className="text-3xl font-black text-white opacity-80">
                                                3
                                            </div>

                                            {/* Profile Picture */}
                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-4 border-white shadow-md">
                                                {user.profile_picture ? (
                                                    <img
                                                        src={user.profile_picture}
                                                        alt="3rd place"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stats */}
                                            <div className="flex flex-col items-center space-y-2 w-full">
                                                {/* Total Marks */}
                                                <div className="flex items-center space-x-1 bg-white/90 rounded-full px-2 py-1 shadow-sm">
                                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-black text-xs text-gray-900">{user.total_marks}</span>
                                                </div>

                                                {/* Quiz Count */}
                                                <div className="flex items-center space-x-1 bg-white/90 rounded-full px-2 py-1 shadow-sm">
                                                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    <span className="font-black text-xs text-gray-900">{user.total_quizzes}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div className="text-center text-gray-700 py-8">
                        {t({ en: 'No users yet', bm: 'Tiada pengguna lagi' })}
                    </div>
                )}
            </div>

            {/* View Full Leaderboard Button */}
            <div className="px-6 pb-6">
                <button
                    onClick={onViewFullLeaderboard}
                    className="block w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-black rounded-xl transition duration-200 text-center shadow-lg hover:shadow-xl transform hover:scale-105 uppercase tracking-wide"
                >
                    {t({ en: 'View Full Leaderboard', bm: 'Lihat Papan Pendahulu Penuh' })}
                </button>
            </div>
        </div>
    );
}
