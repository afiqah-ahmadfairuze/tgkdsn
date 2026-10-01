import { ReactNode, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Navigation from '@/Components/Navigation';
import FeedbackForm from '@/Components/FeedbackForm';
import { useLanguage } from '@/Contexts/LanguageContext';

interface TanganakDusunLayoutProps {
    readonly children: ReactNode;
    readonly title?: string;
    readonly auth: { user: any };
    readonly backgroundStyle?: React.CSSProperties;
    readonly hideNavigation?: boolean;
    readonly hideFooter?: boolean;
}

/*
 * Main layout wrapper for all TanganakDusun pages
 * Includes navigation, footer, and feedback modal
 */
export default function TanganakDusunLayout({ children, title = 'TanganakDusun', auth, backgroundStyle, hideNavigation = false, hideFooter = false }: TanganakDusunLayoutProps) {
    const { t } = useLanguage();
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    /* Opens feedback modal for logged-in users or redirects to login */
    const handleFeedbackClick = () => {
        if (!auth.user) {
            window.location.href = '/login';
        } else {
            setShowFeedbackModal(true);
        }
    };

    return (
        <>
            <Head title={title} />
            <div className="flex flex-col min-h-screen" style={backgroundStyle}>
                {!hideNavigation && <Navigation auth={auth} />}
                <main className="flex-1">{children}</main>

                {/* Footer */}
                {!hideFooter && (
                <footer className="text-gray-100 bg-green-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left Side */}
                            <div>
                                <h3 className="text-white font-bold text-lg mb-2">TanganakDusun</h3>
                                <p className="text-sm mb-4">
                                    {t({
                                        en: 'Learn Dusun language and culture in a fun way!',
                                        bm: 'Belajar bahasa dan budaya Dusun dengan cara yang menyeronokkan!'
                                    })}
                                </p>
                                <p className="text-sm">
                                    {t({
                                        en: '© 2025 TanganakDusun. All rights reserved.',
                                        bm: '© 2025 TanganakDusun. Hak cipta terpelihara.'
                                    })}
                                </p>
                            </div>
                            {/* Middle Side - Empty */}
                            <div></div>
                            {/* Right Side */}
                            <div>
                                <h4 className="text-white font-semibold mb-4">
                                    {t({
                                        en: 'Contact Us',
                                        bm: 'Hubungi Kami'
                                    })}
                                </h4>
                                <p className="text-sm mb-4">
                                    Email: official.afiqah02@gmail.com
                                </p>
                                <button
                                    onClick={handleFeedbackClick}
                                    className="block text-sm hover:text-white transition cursor-pointer"
                                >
                                    {t({
                                        en: 'Send Feedback & Review',
                                        bm: 'Hantar Maklum Balas & Ulasan'
                                    })}
                                </button>
                            </div>
                        </div>
                    </div>
                </footer>
                )}

                {/* Feedback Modal */}
                {showFeedbackModal && <FeedbackForm onClose={() => setShowFeedbackModal(false)} />}
            </div>
        </>
    );
}
