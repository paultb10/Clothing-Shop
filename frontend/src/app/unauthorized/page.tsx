'use client';

import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center text-center p-6 bg-gray-50">
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-red-600">🚫 Access Denied</h1>
                <p className="text-gray-700">You must be an admin to view this page.</p>

                <button
                    onClick={() => router.push('/homepage')}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md shadow transition"
                >
                    🏠 Back to Homepage
                </button>
            </div>
        </div>
    );
}
