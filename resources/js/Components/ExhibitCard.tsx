interface ExhibitCardProps {
    title: string;
    description: string;
}

/*
 * Card for displaying virtual museum exhibit information
 * Features a yellow left border accent
 */
export default function ExhibitCard({ title, description }: ExhibitCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 border-l-4 border-tgkdsn-yellow">
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
