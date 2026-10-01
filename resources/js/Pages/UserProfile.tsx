import TanganakDusunLayout from '@/Layouts/TanganakDusunLayout';
import { useLanguage } from '@/Contexts/LanguageContext';
import { PageProps } from '@/types';
import { useState } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

interface UserData {
    id: number;
    user_id: string;
    name: string;
    email: string;
    birthday: string | null;
    age: number | null;
    gender: string | null;
    guardian_fullname: string | null;
    guardian_phone: string | null;
    guardian_email: string | null;
    profile_picture: string | null;
}

interface Stats {
    leaderboard_rank: number;
    total_quizzes: number;
    total_marks: number;
    streak: {
        current_streak: number;
        last_quiz_date: string | null;
    };
}

interface LeaderboardHistoryItem {
    rank: number;
    total_marks: number;
    total_quizzes: number;
    streak_count: number;
    reset_date: string;
}

interface ActivityHistoryItem {
    type: 'quiz_attempt' | 'learned_material' | 'dictionary_search' | 'feedback_submission';
    quiz_title?: string;
    quiz_category?: string | null;
    marks_obtained?: number;
    material_title?: string;
    search_word?: string;
    feedback_language?: string;
    timestamp: string;
}

interface UserProfileProps extends PageProps {
    user: UserData;
    stats: Stats;
    leaderboard_history: LeaderboardHistoryItem[];
    activity_history: ActivityHistoryItem[];
}

export default function UserProfile({ auth, user, stats, leaderboard_history, activity_history }: UserProfileProps) {
    const { t } = useLanguage();
    const { props } = usePage<UserProfileProps>();
    const flash = (props as any).flash;

    const backgroundStyle = {
        backgroundImage: 'url(/images/Hero.jpg)',
        backgroundAttachment: 'fixed' as const,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    };

    // State for modals
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showGuardianModal, setShowGuardianModal] = useState(false);
    const [showFullActivityHistory, setShowFullActivityHistory] = useState(false);
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // ✅ Password Change Form - Using Inertia useForm
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // ✅ Email Change Form - Using Inertia useForm
    const emailForm = useForm({
        new_email: '',
        password: '',
    });

    // ✅ Guardian Info Form - Using Inertia useForm
    const guardianForm = useForm({
        guardian_fullname: user.guardian_fullname || '',
        guardian_phone: user.guardian_phone || '',
        guardian_email: user.guardian_email || '',
    });

    // ✅ Profile Picture Form - Using Inertia useForm
    const profilePictureForm = useForm<{ profile_picture: File | null }>({
        profile_picture: null,
    });

    // Handle password change submission
    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ Using Inertia router.patch() method
        passwordForm.patch(route('profile.password.update'), {
            onSuccess: () => {
                setShowPasswordModal(false);
                passwordForm.reset();
            },
        });
    };

    // Handle email change submission
    const handleEmailChange = (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ Using Inertia router.post() method
        emailForm.post(route('profile.request-email-change'), {
            onSuccess: () => {
                setShowEmailModal(false);
                emailForm.reset();
            },
        });
    };

    // Handle guardian info update
    const handleGuardianUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ Using Inertia router.patch() method
        guardianForm.patch(route('profile.guardian.update'), {
            onSuccess: () => {
                setShowGuardianModal(false);
            },
        });
    };

    // Handle profile picture selection
    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePictureFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewUrl(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle profile picture upload
    const handleUploadProfilePicture = () => {
        if (!profilePictureFile) return;

        // ✅ Update form data with file
        profilePictureForm.setData('profile_picture', profilePictureFile);

        // ✅ Using Inertia router.post() - automatically handles FormData for files
        profilePictureForm.post(route('profile.picture.update'), {
            onSuccess: () => {
                setProfilePictureFile(null);
                setPreviewUrl(null);
            },
        });
    };

    // Render activity item component
    const renderActivityItem = (activity: ActivityHistoryItem) => (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition">
            <div className="flex items-start gap-4">
                {/* Icon based on activity type */}
                <div className="flex-shrink-0 mt-1">
                    {activity.type === 'quiz_attempt' && (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 100 2 1 1 0 100 2v7a1 1 0 001 1h6a1 1 0 001-1V7a1 1 0 100-2 2 2 0 01-2-2 2 2 0 00-2-2H6a2 2 0 00-2 2zm9 2H8v7h5V7z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                    {activity.type === 'learned_material' && (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                        </div>
                    )}
                    {activity.type === 'dictionary_search' && (
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                    {activity.type === 'feedback_submission' && (
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                                <path fillRule="evenodd" d="M3 7.794A1 1 0 014.794 7h10.412A1 1 0 0116 7.794v.412a1 1 0 01-.794 1A1 1 0 0116 9.412v.412a1 1 0 01-.794 1A1 1 0 0116 11.412v.412a1 1 0 01-.794 1H4.794A1 1 0 014 12.618v-.412a1 1 0 01.794-1A1 1 0 014 10.794v-.412a1 1 0 01.794-1A1 1 0 014 8.794v-.412a1 1 0 01-.794-1A1 1 0 014 7.794v-.412z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Activity Details */}
                <div className="flex-1 min-w-0">
                    {activity.type === 'quiz_attempt' && (
                        <div>
                            <p className="text-gray-900 font-medium">
                                {t({ en: 'Attempted Quiz:', bm: 'Cuba Kuiz:' })} <span className="text-blue-600">{activity.quiz_title}</span>
                            </p>
                            {activity.quiz_category && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {t({ en: 'Category:', bm: 'Kategori:' })} {activity.quiz_category}
                                </p>
                            )}
                            <p className="text-sm text-gray-600 mt-1">
                                {t({ en: 'Marks:', bm: 'Markah:' })} <span className="font-semibold text-blue-600">{activity.marks_obtained}</span>
                            </p>
                        </div>
                    )}
                    {activity.type === 'learned_material' && (
                        <div>
                            <p className="text-gray-900 font-medium">
                                {t({ en: 'Learned Material:', bm: 'Bahan Dipelajari:' })} <span className="text-green-600">{activity.material_title}</span>
                            </p>
                        </div>
                    )}
                    {activity.type === 'dictionary_search' && (
                        <div>
                            <p className="text-gray-900 font-medium">
                                {t({ en: 'Searched the word', bm: 'Mencari perkataan' })} <span className="text-purple-600">"{activity.search_word}"</span>
                            </p>
                        </div>
                    )}
                    {activity.type === 'feedback_submission' && (
                        <div>
                            <p className="text-gray-900 font-medium">
                                {t({ en: 'Submitted Feedback', bm: 'Hantar Maklum Balas' })}
                            </p>
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                        {new Date(activity.timestamp).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <TanganakDusunLayout auth={auth} title="Profile - TanganakDusun" backgroundStyle={backgroundStyle}>
            {/* Main Content */}
            <div>
            {/* Success/Error Notification Banner */}
            {flash?.success && (
                <div className="fixed top-4 right-4 max-w-md p-4 rounded-lg shadow-lg text-white z-40 bg-green-500">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="font-medium">{flash.success}</p>
                        </div>
                    </div>
                </div>
            )}

            {flash?.error && (
                <div className="fixed top-4 right-4 max-w-md p-4 rounded-lg shadow-lg text-white z-40 bg-red-500">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="font-medium">{flash.error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Profile Card */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white text-gray-900 rounded-xl shadow-lg p-8 md:p-12">
                        {/* Profile Header */}
                        <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 pb-12 border-b border-gray-200 text-gray-900">
                            {t({ en: 'Your Profile', bm: 'Profil Anda' })}
                        </h1>

                        {/* User Profile Section */}
                        <div className="mb-12 pb-12 border-b border-gray-200">
                            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                                {/* Avatar with Edit Icon */}
                                <div className="relative">
                                    <div className="w-32 h-32 bg-tgkdsn-yellow rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                                        {previewUrl || user.profile_picture ? (
                                            <img
                                                src={previewUrl || (user.profile_picture?.startsWith('/') ? user.profile_picture : `/storage/${user.profile_picture}`) || ''}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <svg
                                                className="w-16 h-16 text-gray-900"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    {/* Edit icon badge */}
                                    <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfilePictureChange}
                                            className="hidden"
                                        />
                                        <svg
                                            className="w-4 h-4 text-gray-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                            />
                                        </svg>
                                    </label>
                                </div>

                                {/* User Info and Actions */}
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-3xl font-bold mb-6">{user.name}</h2>

                                    {/* Upload button if file selected */}
                                    {profilePictureFile && (
                                        <button
                                            onClick={handleUploadProfilePicture}
                                            disabled={profilePictureForm.processing}
                                            className="px-6 py-2 bg-tgkdsn-yellow hover:bg-tgkdsn-yellow-dark text-gray-900 font-medium rounded-md transition duration-150 mb-4 disabled:opacity-60"
                                        >
                                            {profilePictureForm.processing ? t({ en: 'Uploading...', bm: 'Sedang memuat naik...' }) : t({ en: 'Upload Picture', bm: 'Muat Naik Gambar' })}
                                        </button>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                                        <button
                                            onClick={() => setShowEmailModal(true)}
                                            className="px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium rounded-md transition duration-150 inline-flex items-center justify-center space-x-1"
                                        >
                                            <svg
                                                className="w-3 h-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span>
                                                {t({
                                                    en: 'Change Email',
                                                    bm: 'Tukar Email',
                                                })}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => setShowPasswordModal(true)}
                                            className="px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium rounded-md transition duration-150 inline-flex items-center justify-center space-x-1"
                                        >
                                            <svg
                                                className="w-3 h-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                />
                                            </svg>
                                            <span>
                                                {t({
                                                    en: 'Change Password',
                                                    bm: 'Tukar Kata Laluan',
                                                })}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => setShowGuardianModal(true)}
                                            className="px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium rounded-md transition duration-150 inline-flex items-center justify-center space-x-1"
                                        >
                                            <svg
                                                className="w-3 h-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M9 9H3v11a2 2 0 002 2h14a2 2 0 002-2V9h-6m0 0h6"
                                                />
                                            </svg>
                                            <span>
                                                {t({
                                                    en: 'Edit Guardian Info',
                                                    bm: 'Edit Maklumat Penjaga',
                                                })}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="mb-12 pb-12 border-b border-gray-200">
                            <h3 className="text-2xl font-bold mb-6 text-gray-900">{t({ en: 'Personal Information', bm: 'Maklumat Peribadi' })}</h3>
                            <div className="space-y-6">
                                {/* Email - Full width row */}
                                <div>
                                    <p className="text-gray-600 text-sm mb-2">{t({ en: 'Email', bm: 'Email' })}</p>
                                    <p className="text-lg text-gray-900 break-words">{user.email || t({ en: 'Not provided', bm: 'Tidak disediakan' })}</p>
                                </div>

                                {/* User ID, Age, Gender - Separate row with gaps */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-6">
                                    <div>
                                        <p className="text-gray-600 text-sm mb-2">{t({ en: 'User ID', bm: 'ID Pengguna' })}</p>
                                        <p className="text-lg text-gray-900">{user.user_id || t({ en: 'Not provided', bm: 'Tidak disediakan' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm mb-2">{t({ en: 'Age', bm: 'Umur' })}</p>
                                        <p className="text-lg text-gray-900">{user.age ? user.age : t({ en: 'Not provided', bm: 'Tidak disediakan' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm mb-2">{t({ en: 'Gender', bm: 'Jantina' })}</p>
                                        <p className="text-lg text-gray-900">{user.gender || t({ en: 'Not provided', bm: 'Tidak disediakan' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guardian Information Section */}
                        <div className="mb-12 pb-12 border-b border-gray-200">
                            <h3 className="text-2xl font-bold mb-6 text-gray-900">{t({ en: 'Guardian Information', bm: 'Maklumat Penjaga' })}</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-gray-600 text-sm mb-2">{t({ en: 'Full Name', bm: 'Nama Penuh' })}</p>
                                    <p className="text-lg text-gray-900">{user.guardian_fullname || t({ en: 'Not provided', bm: 'Tidak disediakan' })}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm mb-2">{t({ en: 'Phone Number', bm: 'Nombor Telefon' })}</p>
                                    <p className="text-lg text-gray-900">{user.guardian_phone || t({ en: 'Not provided', bm: 'Tidak disediakan' })}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm mb-2">{t({ en: 'Email', bm: 'Email' })}</p>
                                    <p className="text-lg text-gray-900">{user.guardian_email || t({ en: 'Not provided', bm: 'Tidak disediakan' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Section */}
                        <div className="grid md:grid-cols-4 gap-6 mb-12 pb-12 border-b border-gray-200">
                            {/* Leaderboard Rank Card */}
                            <div className="text-center p-6 bg-gray-100 rounded-lg">
                                <div className="flex items-center justify-center space-x-3 mb-4">
                                    <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <h3 className="text-lg font-bold text-gray-900">{t({ en: 'Rank', bm: 'Kedudukan' })}</h3>
                                </div>
                                <p className="text-4xl font-bold text-blue-600">#{stats.leaderboard_rank}</p>
                            </div>

                            {/* Quizzes Completed Card */}
                            <div className="text-center p-6 bg-gray-100 rounded-lg">
                                <div className="flex items-center justify-center space-x-3 mb-4">
                                    <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <h3 className="text-lg font-bold text-gray-900">{t({ en: 'Quizzes', bm: 'Kuiz' })}</h3>
                                </div>
                                <p className="text-4xl font-bold text-green-600">{stats.total_quizzes}</p>
                            </div>

                            {/* Total Marks Card */}
                            <div className="text-center p-6 bg-gray-100 rounded-lg">
                                <div className="flex items-center justify-center space-x-3 mb-4">
                                    <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 100 2 1 1 0 100 2v7a1 1 0 001 1h6a1 1 0 001-1V7a1 1 0 100-2 2 2 0 01-2-2 2 2 0 00-2-2H6a2 2 0 00-2 2zm9 2H8v7h5V7z" clipRule="evenodd" />
                                    </svg>
                                    <h3 className="text-lg font-bold text-gray-900">{t({ en: 'Total Marks', bm: 'Jumlah Markah' })}</h3>
                                </div>
                                <p className="text-4xl font-bold text-purple-600">{stats.total_marks || 0}</p>
                            </div>

                            {/* Streak Card */}
                            <div className="text-center p-6 bg-gray-100 rounded-lg">
                                <div className="flex items-center justify-center space-x-3 mb-4">
                                    <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4z" />
                                        <path d="M3 7a1 1 0 011-1h2v10H4a1 1 0 01-1-1V7z" />
                                        <path d="M14 7a1 1 0 011-1h2v10h-2a1 1 0 01-1-1V7z" />
                                    </svg>
                                    <h3 className="text-lg font-bold text-gray-900">{t({ en: 'Streak', bm: 'Serian' })}</h3>
                                </div>
                                <p className="text-4xl font-bold text-red-600">{stats.streak.current_streak || 0}</p>
                                <p className="text-xs text-gray-600 mt-2">{t({ en: 'days', bm: 'hari' })}</p>
                            </div>
                        </div>

                        {/* Leaderboard History Section */}
                        {leaderboard_history.length > 0 && (
                            <div className="mb-12 pb-12 border-b border-gray-200">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900">{t({ en: 'Leaderboard History', bm: 'Sejarah Papan Pendahulu' })}</h2>
                                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50">
                                                <th className="px-6 py-3 text-left text-gray-700 font-semibold">{t({ en: 'Date', bm: 'Tarikh' })}</th>
                                                <th className="px-6 py-3 text-left text-gray-700 font-semibold">{t({ en: 'Rank', bm: 'Kedudukan' })}</th>
                                                <th className="px-6 py-3 text-left text-gray-700 font-semibold">{t({ en: 'Total Marks', bm: 'Jumlah Markah' })}</th>
                                                <th className="px-6 py-3 text-left text-gray-700 font-semibold">{t({ en: 'Quizzes', bm: 'Kuiz' })}</th>
                                                <th className="px-6 py-3 text-left text-gray-700 font-semibold">{t({ en: 'Streak', bm: 'Serian' })}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaderboard_history.map((item, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-gray-900">{new Date(item.reset_date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-blue-600 font-semibold">#{item.rank}</td>
                                                    <td className="px-6 py-4 text-gray-900">{item.total_marks}</td>
                                                    <td className="px-6 py-4 text-gray-900">{item.total_quizzes}</td>
                                                    <td className="px-6 py-4 text-gray-900">{item.streak_count} {t({ en: 'days', bm: 'hari' })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Activity History Section */}
                        {activity_history && activity_history.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">{t({ en: 'Activity History', bm: 'Sejarah Aktiviti' })}</h2>
                                    <button
                                        onClick={() => setShowFullActivityHistory(true)}
                                        className="px-4 py-2 rounded-md font-medium transition duration-150 text-white"
                                        style={{ backgroundColor: '#9c27b0' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7b1fa2')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#9c27b0')}
                                    >
                                        {t({ en: 'View Full History', bm: 'Lihat Sejarah Penuh' })}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {activity_history.slice(0, 3).map((activity, index) => (
                                        <div key={index}>
                                            {renderActivityItem(activity)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ============ MODALS ============ */}

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4 text-blue-600">{t({ en: 'Change Password', bm: 'Tukar Kata Laluan' })}</h3>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">{t({ en: 'Current Password', bm: 'Kata Laluan Semasa' })}</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    disabled={passwordForm.processing}
                                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:bg-gray-100"
                                />
                                <InputError message={passwordForm.errors.current_password} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">{t({ en: 'New Password', bm: 'Kata Laluan Baru' })}</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    disabled={passwordForm.processing}
                                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:bg-gray-100"
                                />
                                <InputError message={passwordForm.errors.password} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">{t({ en: 'Confirm Password', bm: 'Potong Semula Kata Laluan' })}</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    disabled={passwordForm.processing}
                                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:bg-gray-100"
                                />
                                <InputError message={passwordForm.errors.password_confirmation} />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        passwordForm.reset();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded transition"
                                >
                                    {t({ en: 'Cancel', bm: 'Batal' })}
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition disabled:opacity-60"
                                >
                                    {passwordForm.processing ? t({ en: 'Updating...', bm: 'Sedang mengemas kini...' }) : t({ en: 'Update', bm: 'Kemas kini' })}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Email Change Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4 text-blue-600">{t({ en: 'Change Email', bm: 'Tukar Email' })}</h3>

                        <form onSubmit={handleEmailChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">{t({ en: 'New Email', bm: 'Email Baru' })}</label>
                                <input
                                    type="email"
                                    value={emailForm.data.new_email}
                                    onChange={(e) => emailForm.setData('new_email', e.target.value)}
                                    disabled={emailForm.processing}
                                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:bg-gray-100"
                                />
                                <InputError message={emailForm.errors.new_email} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">{t({ en: 'Password', bm: 'Kata Laluan' })}</label>
                                <input
                                    type="password"
                                    value={emailForm.data.password}
                                    onChange={(e) => emailForm.setData('password', e.target.value)}
                                    disabled={emailForm.processing}
                                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:bg-gray-100"
                                />
                                <InputError message={emailForm.errors.password} />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEmailModal(false);
                                        emailForm.reset();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded transition"
                                >
                                    {t({ en: 'Cancel', bm: 'Batal' })}
                                </button>
                                <button
                                    type="submit"
                                    disabled={emailForm.processing}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition disabled:opacity-60"
                                >
                                    {emailForm.processing ? t({ en: 'Updating...', bm: 'Sedang mengemas kini...' }) : t({ en: 'Update', bm: 'Kemas kini' })}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Guardian Info Modal */}
            {showGuardianModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4 text-blue-600">{t({ en: 'Edit Guardian Information', bm: 'Edit Maklumat Penjaga' })}</h3>

                        <form onSubmit={handleGuardianUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">{t({ en: 'Full Name', bm: 'Nama Penuh' })}</label>
                                <input
                                    type="text"
                                    value={guardianForm.data.guardian_fullname}
                                    onChange={(e) => guardianForm.setData('guardian_fullname', e.target.value)}
                                    disabled={guardianForm.processing}
                                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:bg-gray-100"
                                />
                                <InputError message={guardianForm.errors.guardian_fullname} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">{t({ en: 'Phone Number', bm: 'Nombor Telefon' })}</label>
                                <input
                                    type="tel"
                                    value={guardianForm.data.guardian_phone}
                                    onChange={(e) => guardianForm.setData('guardian_phone', e.target.value)}
                                    disabled={guardianForm.processing}
                                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:bg-gray-100"
                                />
                                <InputError message={guardianForm.errors.guardian_phone} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">{t({ en: 'Email', bm: 'Email' })}</label>
                                <input
                                    type="email"
                                    value={guardianForm.data.guardian_email}
                                    onChange={(e) => guardianForm.setData('guardian_email', e.target.value)}
                                    disabled={guardianForm.processing}
                                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:bg-gray-100"
                                />
                                <InputError message={guardianForm.errors.guardian_email} />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowGuardianModal(false);
                                        guardianForm.reset();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded transition"
                                >
                                    {t({ en: 'Cancel', bm: 'Batal' })}
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardianForm.processing}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition disabled:opacity-60"
                                >
                                    {guardianForm.processing ? t({ en: 'Updating...', bm: 'Sedang mengemas kini...' }) : t({ en: 'Update', bm: 'Kemas kini' })}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Full Activity History Modal */}
            {showFullActivityHistory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-hidden flex flex-col p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">{t({ en: 'Full Activity History', bm: 'Sejarah Aktiviti Penuh' })}</h3>
                            <button
                                onClick={() => setShowFullActivityHistory(false)}
                                className="text-gray-500 hover:text-gray-700 transition"
                                title={t({ en: 'Close', bm: 'Tutup' })}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                            {activity_history.length > 0 ? (
                                activity_history.map((activity, index) => (
                                    <div key={index}>
                                        {renderActivityItem(activity)}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">{t({ en: 'No activity history available', bm: 'Tiada sejarah aktiviti tersedia' })}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowFullActivityHistory(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded transition"
                            >
                                {t({ en: 'Close', bm: 'Tutup' })}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </TanganakDusunLayout>
    );
}
