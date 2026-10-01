import TanganakDusunLayout from '@/Layouts/TanganakDusunLayout';
import { useLanguage } from '@/Contexts/LanguageContext';
import { PageProps } from '@/types';

/*
 * Lotud360° virtual tour of the traditional Lotud Dusun house
 * Embeds an interactive 360-degree panorama viewer
 */
export default function VRMuseum({ auth }: PageProps) {
    const { t } = useLanguage();

    const backgroundStyle = {
        backgroundImage: 'url(/images/Hero.jpg)',
        backgroundAttachment: 'fixed' as const,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    };

    return (
        <TanganakDusunLayout auth={auth} title="VR Mini Museum - TanganakDusun" backgroundStyle={backgroundStyle}>
            {/* Main Content Wrapper */}
            <div className="py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ display: 'flex', flexDirection: 'column', gap: '0.5cm' }}>
                    {/* Header Section */}
                    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FF8C00' }}>
                            {t({
                                en: 'Lotud360°',
                                bm: 'Lotud360°'
                            })}
                        </h1>
                        <p className="text-lg text-gray-700">
                            {t({
                                en: 'Let\'s go exploring the Lotud traditional house! Click, turn, and explore every corner while learning fun cultural stories!',
                                bm: 'Jom jalan-jalan dalam rumah tradisional Lotud! Klik, pusing, dan terokai setiap sudut rumah sambil belajar budaya Dusun yang menarik!'
                            })}
                        </p>
                    </div>

                    {/* VR Tour Embed Section */}
                    <div className="rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
                        <iframe
                            title="Lotud360° VR Tour"
                            src="/tgkdsn360/index.html"
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                            allowFullScreen
                        />
                    </div>

                    {/* Traditional Lotud House of Sabah Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Main Heading */}
                        <div className="p-8 md:p-12 border-b border-gray-200">
                            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#FF8C00' }}>
                                {t({
                                    en: 'Traditional Lotud House of Sabah',
                                    bm: 'Rumah Tradisional Lotud Sabah'
                                })}
                            </h2>
                        </div>

                        {/* Section 1: Where Are They From */}
                        <div className="p-8 md:p-12 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                {/* Image */}
                                <div className="flex justify-center">
                                    <img
                                        src="/images/tuaran.png"
                                        alt="Tuaran"
                                        className="w-full h-64 object-cover rounded-lg shadow-md"
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <h3 className="text-2xl font-bold mb-4 text-gray-900">
                                        {t({
                                            en: 'Where Are They From?',
                                            bm: 'Dari Mana Mereka Datang?'
                                        })}
                                    </h3>
                                    <div className="text-gray-700 leading-relaxed space-y-3">
                                        <p>
                                            {t({
                                                en: 'Long ago, the Lotud people lived in Tuaran, a beautiful place in Sabah.',
                                                bm: 'Pada suatu masa dahulu, orang Lotud tinggal di Tuaran, sebuah tempat yang indah di Sabah.'
                                            })}
                                        </p>
                                        <p>
                                            {t({
                                                en: 'They liked living near rivers and green land so they could grow rice and find food easily.',
                                                bm: 'Mereka suka tinggal berhampiran sungai dan tanah hijau supaya mudah menanam padi dan mencari makanan.'
                                            })}
                                        </p>
                                        <p>
                                            {t({
                                                en: 'Every day, they farm, fish, and collect things from the forest for their daily life.',
                                                bm: 'Setiap hari, mereka bercucuk tanam, menangkap ikan, dan mengutip hasil hutan untuk kehidupan seharian.'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Who Are They */}
                        <div className="p-8 md:p-12 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                {/* Content */}
                                <div>
                                    <h3 className="text-2xl font-bold mb-4 text-gray-900">
                                        {t({
                                            en: 'Who Are They?',
                                            bm: 'Siapakah Mereka?'
                                        })}
                                    </h3>
                                    <div className="text-gray-700 leading-relaxed space-y-3">
                                        <p>
                                            {t({
                                                en: 'The Lotud people are part of the Kadazandusun family.',
                                                bm: 'Orang Lotud ialah sebahagian daripada keluarga Kadazandusun.'
                                            })}
                                        </p>
                                        <p>
                                            {t({
                                                en: 'They value old stories, traditions, and beliefs from their ancestors.',
                                                bm: 'Mereka menghargai cerita lama, adat budaya, dan kepercayaan nenek moyang.'
                                            })}
                                        </p>
                                        <p>
                                            {t({
                                                en: 'They live together, help each other, and protect their culture with care.',
                                                bm: 'Mereka hidup bersama, saling membantu, dan menjaga budaya mereka dengan penuh rasa hormat.'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Image */}
                                <div className="flex justify-center">
                                    <img
                                        src="/images/tuaranLotud.jpg"
                                        alt="Tuaran Lotud"
                                        className="w-full h-64 object-cover rounded-lg shadow-md"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* End Static Background Wrapper */}
        </TanganakDusunLayout>
    );
}
