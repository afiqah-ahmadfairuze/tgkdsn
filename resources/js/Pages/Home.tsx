import TanganakDusunLayout from '@/Layouts/TanganakDusunLayout';
import { useLanguage } from '@/Contexts/LanguageContext';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';

/*
 * Home page showcasing TanganakDusun features
 * Features hero section, feature cards, and Lotud house carousel
 */
export default function Home({ auth }: PageProps) {
    const { t } = useLanguage();
    const [currentLotudHouseIndex, setCurrentLotudHouseIndex] = useState(0);

    const lotudHouseImages = [
        '/images/lotudhouse1.jpg',
        '/images/lotudhouse2.jpg',
        '/images/lotudhouse3.jpg',
        '/images/lotudhouse4.jpg'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentLotudHouseIndex((prevIndex) => (prevIndex + 1) % lotudHouseImages.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    /* Navigates to the previous image in the carousel */
    const goToPrevLotudHouse = () => {
        setCurrentLotudHouseIndex((prevIndex) => (prevIndex - 1 + lotudHouseImages.length) % lotudHouseImages.length);
    };

    /* Navigates to the next image in the carousel */
    const goToNextLotudHouse = () => {
        setCurrentLotudHouseIndex((prevIndex) => (prevIndex + 1) % lotudHouseImages.length);
    };

    const backgroundStyle = {
        backgroundImage: 'url(/images/Hero.jpg)',
        backgroundAttachment: 'fixed' as const,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    };

    return (
        <TanganakDusunLayout auth={auth} title="Home - TanganakDusun" backgroundStyle={backgroundStyle}>
            {/* Main Content Wrapper */}
            <div style={{
                flex: '1',
                display: 'flex',
                flexDirection: 'column'
            }}>

            {/* Section 1: Hero Section */}
            <section className="py-16">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="rounded-xl shadow-lg p-8 md:p-12 bg-white/70 backdrop-blur-md border border-white/30">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            {/* Left Side - Logo */}
                            <div className="flex justify-center">
                                <img
                                    src="/images/tgkdsn-logo.png"
                                    alt="TanganakDusun Logo"
                                    className="w-full max-w-sm h-auto"
                                />
                            </div>

                            {/* Right Side - Content */}
                            <div className="flex flex-col justify-center">
                                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                                    {t({
                                        en: 'TanganakDusun',
                                        bm: 'TanganakDusun'
                                    })}
                                </h1>

                                <div className="text-lg md:text-xl leading-relaxed text-gray-700 mb-8">
                                    <p className="mb-2">{t({ en: 'TanganakDusun is a fun place to learn Dusun language and culture!', bm: 'TanganakDusun ialah tempat untuk belajar bahasa dan budaya Dusun dengan cara yang menyeronokkan!' })}</p>
                                    <p className="mb-2">{t({ en: 'Here, you can play, look at pictures, and try interactive activities while learning.', bm: 'Di sini, anda boleh bermain, melihat gambar, dan mencuba aktiviti interaktif sambil belajar.' })}</p>
                                    <p>{t({ en: 'Let\'s learn through play and help keep Dusun heritage alive for future generations.', bm: 'Jom belajar sambil bermain dan bantu menjaga warisan Dusun untuk generasi akan datang.' })}</p>
                                </div>

                                <button
                                    onClick={() => window.location.href = '/learning-materials'}
                                    className="px-8 py-3 rounded-lg shadow-md hover:shadow-xl transition duration-300 text-black font-semibold text-lg inline-flex items-center w-fit bg-lime-400/70 backdrop-blur-md border border-lime-300/50"
                                >
                                    {t({
                                        en: 'Start Exploring',
                                        bm: 'Mula Terokai'
                                    })}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Main Features Section */}
            <section className="py-16">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="rounded-xl shadow-lg p-8 md:p-12 bg-white/70 backdrop-blur-md border border-white/30">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                            {t({
                                en: 'What\'s Fun Here?',
                                bm: 'Apa Yang Menarik Di Sini?'
                            })}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                            {/* Lotud360 Card */}
                            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                                <div className="overflow-hidden h-40 md:h-48">
                                    <img
                                        src="/images/Lotud360.png"
                                        alt="Lotud360"
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {t({
                                            en: 'Lotud360°',
                                            bm: 'Lotud360°'
                                        })}
                                    </h3>
                                    <div className="text-gray-700 text-sm leading-relaxed">
                                        <p className="mb-1">{t({ en: 'Let\'s go exploring the Lotud traditional house!', bm: 'Jom jalan-jalan dalam rumah tradisional Lotud!' })}</p>
                                        <p>{t({ en: 'Click, turn, and explore every corner while learning fun cultural stories!', bm: 'Klik, pusing, dan terokai setiap sudut rumah sambil belajar budaya Dusun yang menarik!' })}</p>
                                    </div>
                                </div>
                            </div>

                            {/* DusLearn Card */}
                            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                                <div className="overflow-hidden h-40 md:h-48">
                                    <img
                                        src="/images/DusLearn.png"
                                        alt="DusLearn"
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {t({
                                            en: 'DusLearn',
                                            bm: 'DusLearn'
                                        })}
                                    </h3>
                                    <div className="text-gray-700 text-sm leading-relaxed">
                                        <p className="mb-1">{t({ en: 'Learn Dusun like playing a game!', bm: 'Belajar bahasa Dusun macam main permainan!' })}</p>
                                        <p>{t({ en: 'Look at the cards, read the words, and learn simple sentences happily!', bm: 'Lihat kad, baca perkataan, dan belajar ayat mudah dengan gembira!' })}</p>
                                    </div>
                                </div>
                            </div>

                            {/* BorosBank Card */}
                            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                                <div className="overflow-hidden h-40 md:h-48">
                                    <img
                                        src="/images/BorosBank.png"
                                        alt="BorosBank"
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {t({
                                            en: 'BorosBank',
                                            bm: 'BorosBank'
                                        })}
                                    </h3>
                                    <div className="text-gray-700 text-sm leading-relaxed">
                                        <p className="mb-1">{t({ en: 'Wondering what a Dusun word means?', bm: 'Tertanya-tanya maksud perkataan Dusun?' })}</p>
                                        <p>{t({ en: 'Open BorosBank and find the meaning quickly and easily!', bm: 'Buka BorosBank dan cari maksudnya dengan cepat dan senang!' })}</p>
                                    </div>
                                </div>
                            </div>

                            {/* QuizBoros Card */}
                            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                                <div className="overflow-hidden h-40 md:h-48">
                                    <img
                                        src="/images/QuizBoros.png"
                                        alt="QuizBoros"
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {t({
                                            en: 'QuizBoros',
                                            bm: 'QuizBoros'
                                        })}
                                    </h3>
                                    <div className="text-gray-700 text-sm leading-relaxed">
                                        <p className="mb-1">{t({ en: 'Quiz time!', bm: 'Masa untuk main kuiz!' })}</p>
                                        <p>{t({ en: 'Answer questions, collect points, and show how good you are at Dusun!', bm: 'Jawab soalan, kumpul markah, dan buktikan anda hebat dalam bahasa Dusun!' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: VR Mini Museum Section */}
            <section className="py-16">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="text-gray-900 rounded-xl shadow-lg p-8 md:p-12 bg-white/70 backdrop-blur-md border border-white/30">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            {/* Left Side - Text Content */}
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                                {t({
                                    en: 'Lotud360°: Lotud Dusun House',
                                    bm: 'Lotud360°: Rumah Dusun Lotud'
                                })}
                            </h2>
                            <div className="text-lg mb-6 text-gray-700">
                                <p className="mb-2">{t({ en: 'Let\'s go inside the Lotud Dusun house!', bm: 'Jom masuk rumah Lotud Dusun!' })}</p>
                                <p className="mb-2">{t({ en: 'Turn around and click to see the house.', bm: 'Pusing-pusing dan klik untuk lihat rumah.' })}</p>
                                <p className="mb-2">{t({ en: 'Learn Dusun culture with fun pictures and cards', bm: 'Belajar budaya Dusun dengan gambar dan kad seronok!' })}</p>
                                <p>{t({ en: 'Play and learn anytime!', bm: 'Boleh main dan belajar bila-bila masa!' })}</p>
                            </div>
                            <button
                                onClick={() => window.location.href = '/vr-museum'}
                                className="px-6 py-3 rounded-lg shadow-md hover:shadow-xl transition duration-300 text-black font-semibold inline-flex items-center bg-lime-400/70 backdrop-blur-md border border-lime-300/50"
                            >
                                {t({
                                    en: 'Explore Now',
                                    bm: 'Alami Sekarang'
                                })}
                            </button>
                        </div>

                        {/* Right Side - Lotud House Image Carousel */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-4 shadow-lg">
                                <img
                                    src={lotudHouseImages[currentLotudHouseIndex]}
                                    alt="Lotud Dusun House"
                                    className="w-full h-full object-cover transition-opacity duration-500"
                                />
                            </div>

                            {/* Carousel Controls */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={goToPrevLotudHouse}
                                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition duration-200 shadow-md"
                                    title="Previous image"
                                >
                                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <div className="flex gap-2">
                                    {lotudHouseImages.map((_, index) => (
                                        <button
                                            key={`lotud-${index}`}
                                            onClick={() => setCurrentLotudHouseIndex(index)}
                                            className={`w-2 h-2 rounded-full transition duration-300 ${
                                                index === currentLotudHouseIndex ? 'bg-gray-800' : 'bg-gray-400'
                                            }`}
                                            title={`Go to image ${index + 1}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={goToNextLotudHouse}
                                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition duration-200 shadow-md"
                                    title="Next image"
                                >
                                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </section>

            </div>
            {/* End Main Content Wrapper */}
        </TanganakDusunLayout>
    );
}
