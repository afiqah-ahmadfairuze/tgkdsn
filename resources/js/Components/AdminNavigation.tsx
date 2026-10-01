import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Users, BookOpen, Book, Globe, AlertCircle, Trophy } from 'lucide-react';

interface AdminNavigationProps {
    readonly auth?: any;
    readonly themeColor?: string;
}

/*
 * Admin navigation bar with responsive menu
 * Displays main admin sections and handles logout
 */
export default function AdminNavigation({ auth, themeColor = '#3B82F6' }: AdminNavigationProps) {
    const { url } = usePage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    /* Checks if a navigation link matches the current URL */
    const isActive = (href: string) => {
        if (href === '/admin' || href === '/admin/dashboard') {
            return url === '/admin' || url === '/admin/dashboard';
        }
        return url.startsWith(href);
    };

    /* Logs out the user and redirects to home page */
    const handleLogout = () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        // Use router.post to destroy session, then navigate home with fresh CSRF token
        router.post(route('logout'), {}, {
            onSuccess: () => {
                // Navigate to home with fresh CSRF token
                router.visit('/');
            },
            onError: () => {
                setIsLoggingOut(false);
            },
        });
    };

    const menuItems = [
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
        },
        {
            name: 'User',
            href: '/admin/users',
            icon: <Users className="w-4 h-4" />,
        },
        {
            name: 'Quiz',
            href: '/admin/quiz',
            icon: <BookOpen className="w-4 h-4" />,
        },
        {
            name: 'Learning Material',
            href: '/admin/learning-materials',
            icon: <Book className="w-4 h-4" />,
        },
        {
            name: 'Leaderboard',
            href: '/admin/leaderboard',
            icon: <Trophy className="w-4 h-4" />,
        },
        {
            name: 'Dictionary',
            href: '/admin/dictionary',
            icon: <Globe className="w-4 h-4" />,
        },
        {
            name: 'Feedbacks & Reports',
            href: '/admin/feedback',
            icon: <AlertCircle className="w-4 h-4" />,
        },
    ];

    return (
        <>
            <nav style={{ backgroundColor: themeColor, borderColor: themeColor }} className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center h-14">
                        {/* Left side - Logo and Desktop Menu */}
                        <div className="flex items-center space-x-8">
                            {/* Logo */}
                            <Link href="/admin/dashboard" className="flex items-center">
                                <img
                                    src="/images/tgkdsn-logo.png"
                                    alt="TanganakDusun Admin"
                                    className="h-12 w-auto"
                                />
                            </Link>

                            {/* Desktop Menu Items */}
                            <div className="hidden lg:flex items-center space-x-6">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center space-x-1.5 font-semibold transition duration-150 text-white ${
                                            isActive(item.href)
                                                ? 'border-b-2 border-white'
                                                : 'hover:border-b-2 hover:border-white'
                                        }`}
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right side - Hamburger and Logout */}
                        <div className="flex items-center space-x-4">
                            {/* Hamburger Menu Button - Mobile/Tablet */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="lg:hidden flex items-center justify-center w-14 h-14 rounded-lg text-white transition duration-150"
                            >
                                {isMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>

                            {/* Logout - Desktop Only */}
                            <button
                                onClick={handleLogout}
                                className="hidden lg:flex items-center space-x-1.5 text-white hover:border-b-2 hover:border-white font-semibold transition duration-150"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div style={{ backgroundColor: themeColor, borderColor: themeColor }} className="lg:hidden border-t">
                        <div className="py-4 space-y-2 flex flex-col items-center">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition duration-150 text-white ${
                                        isActive(item.href)
                                            ? 'border-b-2 border-white'
                                            : 'hover:border-b-2 hover:border-white'
                                    }`}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            ))}

                            {/* Logout in Mobile Menu */}
                            <div className="border-t border-white mt-4 pt-4 w-full flex flex-col items-center">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold text-white hover:border-b-2 hover:border-white transition duration-150"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
