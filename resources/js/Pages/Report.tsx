import TanganakDusunLayout from '@/Layouts/TanganakDusunLayout';
import { PageProps } from '@/types';

export default function Report({ auth }: PageProps) {
    return (
        <TanganakDusunLayout auth={auth} title="Report a Problem - TanganakDusun">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Report a Problem</h1>
                <p className="text-gray-600">Report form coming soon...</p>
            </div>
        </TanganakDusunLayout>
    );
}
