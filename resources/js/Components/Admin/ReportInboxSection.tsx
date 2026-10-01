import { Link } from '@inertiajs/react';

interface Report {
    subject: string;
    status: 'New' | 'In Progress' | 'Resolved';
    date: string;
}

interface ReportInboxSectionProps {
    reports?: Report[];
}

/*
 * Admin dashboard section showing user-submitted reports
 * Displays subject, status (with colored badges), and date
 */
export default function ReportInboxSection({ reports }: ReportInboxSectionProps) {
    const defaultReports: Report[] = [
        {
            subject: 'Quiz error in question #3',
            status: 'New',
            date: '2023-11-15',
        },
        {
            subject: 'VR not loading properly',
            status: 'In Progress',
            date: '2023-11-14',
        },
        {
            subject: 'Incorrect translation in dictionary',
            status: 'New',
            date: '2023-11-13',
        },
    ];

    const reportData = reports || defaultReports;

    /* Returns CSS classes for status badge based on report status */
    const getStatusBadge = (status: string) => {
        const styles = {
            'New': 'bg-red-100 text-red-800',
            'In Progress': 'bg-blue-100 text-blue-800',
            'Resolved': 'bg-green-100 text-green-800',
        };

        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-black px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white">Report Inbox</h3>
                </div>
                <Link
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        alert('View all reports coming soon!');
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
                                Subject
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.map((report, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {report.subject}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(report.status)}`}
                                    >
                                        {report.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {report.date}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
