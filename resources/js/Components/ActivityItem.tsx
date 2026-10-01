interface ActivityItemProps {
    title: string;
    date: string;
}

/*
 * Single activity entry with checkmark icon
 * Used in activity feed lists on dashboard
 */
export default function ActivityItem({ title, date }: ActivityItemProps) {
    return (
        <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition duration-150">
            {/* Yellow checkmark icon */}
            <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-tgkdsn-yellow rounded-full flex items-center justify-center">
                    <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </div>

            {/* Activity details */}
            <div className="flex-1">
                <p className="text-gray-800 font-medium">{title}</p>
                <p className="text-gray-500 text-sm mt-1">{date}</p>
            </div>
        </div>
    );
}
