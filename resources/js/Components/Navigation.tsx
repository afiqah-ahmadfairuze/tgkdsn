import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useLanguage } from '@/Contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { BilingualText } from '@/types/tgkdsn';

interface NavItem {
    name: BilingualText;
    href: string;
    image: string;
    borderColor: string;
}

interface NavigationProps {
    readonly auth: {
        readonly user: any;
    };
}

/*
 * Main site navigation with responsive mobile menu
 * Features circular icons for each section and language toggle
 */
export default function Navigation({ auth }: NavigationProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { t } = useLanguage();
    const { url } = usePage();

    // Base nav items available to all users - branded names for consistency
    const baseNavItems: NavItem[] = [
        { name: { en: 'Home', bm: 'Laman Utama' }, href: '/', image: '/images/Home.png', borderColor: '#FF5757' },
        { name: { en: 'Lotud360°', bm: 'Lotud360°' }, href: '/vr-museum', image: '/images/Lotud360.png', borderColor: '#FFA500' },
        { name: { en: 'QuizBoros', bm: 'QuizBoros' }, href: '/quiz', image: '/images/QuizBoros.png', borderColor: '#FDD835' },
        { name: { en: 'DusLearn', bm: 'DusLearn' }, href: '/learning-materials', image: '/images/DusLearn.png', borderColor: '#66BB6A' },
        { name: { en: 'BorosBank', bm: 'BorosBank' }, href: '/dictionary', image: '/images/BorosBank.png', borderColor: '#2196F3' },
    ];

    // Use only base navigation items
    const navItems: NavItem[] = baseNavItems;

    /* Checks if a navigation link matches the current URL */
    const isActive = (href: string) => {
        if (href === '/') {
            return url === '/';
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

    return (
        <nav className="shadow-lg" style={{ backgroundColor: 'transparent' }}>
            <style>{`
                .nav-label {
                    color: white;
                    transition: color 0.3s ease;
                }

                .nav-item:hover .nav-label {
                    color: var(--item-color);
                }
            `}</style>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-48" style={{ minWidth: 0 }}>
                    {/* Logo and Nav Items */}
                    <div className="flex">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center">
                                <img
                                    src="/images/tgkdsn-logo.png"
                                    alt="TanganakDusun Logo"
                                    className="h-36 w-auto"
                                />
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:ml-4 md:flex md:space-x-4 md:items-center md:flex-wrap">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex flex-col items-center nav-item cursor-pointer transition duration-150"
                                    style={{ '--item-color': item.borderColor } as React.CSSProperties}
                                >
                                    {/* Circular Frame with Image */}
                                    <div
                                        className="flex items-center justify-center rounded-full mb-2 overflow-hidden border-4"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderColor: item.borderColor,
                                            opacity: isActive(item.href) ? 1 : 0.7,
                                            transition: 'opacity 0.3s ease'
                                        }}
                                    >
                                        <img
                                            src={item.image}
                                            alt={t(item.name)}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Label */}
                                    <span
                                        className="text-sm font-black text-center nav-label"
                                        style={{
                                            color: isActive(item.href) ? item.borderColor : 'white',
                                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 -1px 0 rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        {t(item.name)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Language Toggle, Login, Profile */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        <LanguageToggle />

                        {auth.user ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/user-profile"
                                    className="flex items-center justify-center group cursor-pointer transition duration-150"
                                    title={auth.user.name}
                                >
                                    <div
                                        className="flex items-center justify-center rounded-full overflow-hidden"
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            opacity: isActive('/user-profile') ? 1 : 0.7,
                                            transition: 'opacity 0.3s ease',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
                                        }}
                                    >
                                        {auth.user.profile_picture ? (
                                            <img
                                                src={
                                                    auth.user.profile_picture.toString().startsWith('/')
                                                        ? auth.user.profile_picture
                                                        : `/storage/${auth.user.profile_picture}`
                                                }
                                                alt={auth.user.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                                                <svg
                                                    className="w-6 h-6 text-white"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-white hover:text-gray-200 transition duration-150"
                                    title={t({ en: 'Logout', bm: 'Log Keluar' })}
                                >
                                    <svg
                                        className="w-10 h-10"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="text-white hover:text-gray-200 px-0.5 py-0 rounded font-semibold transition duration-150"
                                style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}
                            >
                                {t({ en: 'Login', bm: 'Log Masuk' })}
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-white focus:outline-none transition duration-150 hover:bg-transparent"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isOpen ? (
                                <svg
                                    className="block h-6 w-6 hover:text-red-500 transition duration-150"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6 hover:text-red-500 transition duration-150"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden">
                    {/* Navigation Items - Single Row */}
                    <div className="py-4 px-2 flex flex-row items-center justify-center gap-2 overflow-x-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex flex-col items-center nav-item flex-shrink-0 transition duration-150"
                                style={{ '--item-color': item.borderColor } as React.CSSProperties}
                            >
                                {/* Circular Frame with Image - Smaller */}
                                <div
                                    className="flex items-center justify-center rounded-full mb-1 overflow-hidden border-3"
                                    style={{
                                        width: '56px',
                                        height: '56px',
                                        borderColor: item.borderColor,
                                        opacity: isActive(item.href) ? 1 : 0.7,
                                        transition: 'opacity 0.3s ease'
                                    }}
                                >
                                    <img
                                        src={item.image}
                                        alt={t(item.name)}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Label - Smaller */}
                                <span
                                    className="text-xs font-black text-center nav-label whitespace-nowrap"
                                    style={{
                                        color: isActive(item.href) ? item.borderColor : 'white',
                                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 -1px 0 rgba(255, 255, 255, 0.2)',
                                        fontSize: '0.65rem'
                                    }}
                                >
                                    {t(item.name)}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Controls Row - Language Toggle, Profile, Logout */}
                    <div className="py-4 border-t border-gray-700 flex flex-row items-center justify-center gap-4">
                        <LanguageToggle />
                        {auth.user ? (
                            <>
                                <Link
                                    href="/user-profile"
                                    className="flex items-center justify-center group cursor-pointer transition duration-150 flex-shrink-0"
                                    title={auth.user.name}
                                >
                                    <div
                                        className="flex items-center justify-center rounded-full overflow-hidden"
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            opacity: isActive('/user-profile') ? 1 : 0.7,
                                            transition: 'opacity 0.3s ease',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
                                        }}
                                    >
                                        {auth.user.profile_picture ? (
                                            <img
                                                src={
                                                    auth.user.profile_picture.toString().startsWith('/')
                                                        ? auth.user.profile_picture
                                                        : `/storage/${auth.user.profile_picture}`
                                                }
                                                alt={auth.user.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                                                <svg
                                                    className="w-5 h-5 text-white"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-white hover:text-red-500 transition duration-150 flex-shrink-0"
                                    title={t({ en: 'Logout', bm: 'Log Keluar' })}
                                >
                                    <svg
                                        className="w-8 h-8"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="text-white hover:text-gray-200 px-0.5 py-0 rounded font-semibold transition duration-150"
                                style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}
                            >
                                {t({ en: 'Login', bm: 'Log Masuk' })}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
