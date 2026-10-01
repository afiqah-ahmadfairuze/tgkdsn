import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface FeatureCardProps {
    icon?: ReactNode;
    title: string;
    description: string;
    linkText: string;
    linkHref: string;
}

/*
 * Yellow gradient card for showcasing app features on the home page
 */
export default function FeatureCard({ icon, title, description, linkText, linkHref }: FeatureCardProps) {
    return (
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 p-8 text-white h-full flex flex-col justify-between">
            <div className="flex flex-col space-y-4">
                {icon && (
                    <div className="flex justify-center mb-2">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                            {icon}
                        </div>
                    </div>
                )}
                <h3 className="text-2xl font-bold text-center text-white">{title}</h3>
                <p className="text-sm opacity-90 text-center text-white">{description}</p>
            </div>

            <Link
                href={linkHref}
                className="mt-6 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-md transition duration-150 text-center block no-underline"
            >
                {linkText} →
            </Link>
        </div>
    );
}
