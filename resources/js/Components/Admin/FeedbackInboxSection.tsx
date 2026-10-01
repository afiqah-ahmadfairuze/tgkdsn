import { Link } from '@inertiajs/react';

interface Feedback {
    rating: string;
    comment: string;
    date: string;
}

interface FeedbackInboxSectionProps {
    feedbacks?: Feedback[];
}

/*
 * Admin dashboard section showing recent user feedback
 * Displays ratings, comments, and dates in a table format
 */
export default function FeedbackInboxSection({ feedbacks }: FeedbackInboxSectionProps) {
    const defaultFeedbacks: Feedback[] = [
        {
            rating: '5/5',
            comment: 'Love the new quiz format!',
            date: '2023-11-15',
        },
        {
            rating: '4/5',
            comment: 'Dictionary is very helpful',
            date: '2023-11-14',
        },
        {
            rating: '3/5',
            comment: 'VR needs more content',
            date: '2023-11-12',
        },
    ];

    const feedbackData = feedbacks || defaultFeedbacks;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-black px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white">Feedback Inbox</h3>
                </div>
                <Link
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        alert('View all feedback coming soon!');
                    }}
                    className="text-sm text-gray-300 hover:text-white transition duration-150"
                >
                    View All
                </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rating
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Comment
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {feedbackData.map((feedback, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-tgkdsn-yellow mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {feedback.rating}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {feedback.comment}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {feedback.date}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
