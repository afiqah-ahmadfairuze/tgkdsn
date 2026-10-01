interface Activity {
    action: string;
    user: string;
    timestamp: string;
}

interface ActivityLogSectionProps {
    activities?: Activity[];
}

/*
 * Admin dashboard section showing recent system activities
 * Tracks admin actions like adding quizzes, updating dictionary, etc.
 */
export default function ActivityLogSection({ activities }: ActivityLogSectionProps) {
    const defaultActivities: Activity[] = [
        {
            action: 'Added new quiz: Dusun Traditional Food',
            user: 'Admin',
            timestamp: '2023-11-15 09:23 AM',
        },
        {
            action: "Updated dictionary entry: 'Moginum'",
            user: 'Admin',
            timestamp: '2023-11-14 03:45 PM',
        },
        {
            action: 'Deleted user account: user123',
            user: 'Admin',
            timestamp: '2023-11-14 11:30 AM',
        },
        {
            action: 'Added new learning material: Dusun Folktales',
            user: 'Admin',
            timestamp: '2023-11-13 02:15 PM',
        },
    ];

    const activityData = activities || defaultActivities;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-black px-6 py-4">
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white">Recent Activity Log</h3>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                                Action
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Timestamp
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activityData.map((activity, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition duration-150">
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {activity.action}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                {activity.user}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {activity.timestamp}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
