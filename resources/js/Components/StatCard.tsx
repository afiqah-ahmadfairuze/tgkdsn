import { ReactNode } from 'react';

interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: string;
}

/*
 * Card displaying a statistic with icon, label, and value
 * Used on dashboard pages for metrics display
 */
export default function StatCard({ icon, label, value }: StatCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
            <div className="h-2 bg-tgkdsn-yellow"></div>
            <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                    {icon}
                </div>
                <p className="text-gray-600 text-sm mb-2">{label}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}
