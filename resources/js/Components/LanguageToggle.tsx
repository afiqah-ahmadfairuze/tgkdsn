import { useLanguage } from '@/Contexts/LanguageContext';

/*
 * Toggle button for switching between English and Bahasa Malaysia
 */
export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    /* Switches the app language if different from current */
    const toggleLanguage = (lang: 'en' | 'bm') => {
        if (language !== lang) {
            setLanguage(lang);
        }
    };

    return (
        <div
            className="flex rounded-full p-0.5 font-semibold gap-0.5 bg-gray-800"
            aria-label="Toggle Language"
        >
            {/* BM Button */}
            <button
                onClick={() => toggleLanguage('bm')}
                className={`px-3 py-1 rounded-full transition duration-200 font-semibold text-xs ${
                    language === 'bm'
                        ? 'bg-white text-black shadow-md'
                        : 'text-white hover:bg-white/20'
                }`}
            >
                BM
            </button>

            {/* EN Button */}
            <button
                onClick={() => toggleLanguage('en')}
                className={`px-3 py-1 rounded-full transition duration-200 font-semibold text-xs ${
                    language === 'en'
                        ? 'bg-white text-black shadow-md'
                        : 'text-white hover:bg-white/20'
                }`}
            >
                EN
            </button>
        </div>
    );
}
