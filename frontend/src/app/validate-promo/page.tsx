'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuard from "@/app/components/AdminGuard";

export default function ValidatePromoPage() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleValidate = async () => {
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('http://localhost:8085/api/promos/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await res.json();

            if (!res.ok) {
                setResult(`❌ ${data.message}`);
            } else {
                setResult(`✅ ${data.message}`);
            }
        } catch (err) {
            console.error('Error validating promo code', err);
            setResult('❌ Failed to validate promo code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminGuard>
            <div className="max-w-md mx-auto p-8 mt-12 bg-white rounded-xl shadow space-y-6 border border-gray-100">
                <h1 className="text-3xl font-bold text-center text-gray-800">🔍 Validate a Promo Code</h1>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            User Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="e.g. user@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="mt-1 w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200"
                        />
                    </div>

                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                            Promo Code
                        </label>
                        <input
                            id="code"
                            type="text"
                            placeholder="Enter promo code"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            className="mt-1 w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200"
                        />
                    </div>

                    <button
                        onClick={handleValidate}
                        disabled={loading || !email || !code}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-md font-semibold transition"
                    >
                        {loading ? 'Validating...' : 'Validate Promo'}
                    </button>

                    {result && (
                        <div
                            className={`text-center mt-4 p-3 rounded font-medium ${
                                result.startsWith('✅')
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                            }`}
                        >
                            {result}
                        </div>
                    )}
                </div>

                <div className="pt-4 text-center">
                    <button
                        onClick={() => router.push('/homepage')}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md shadow transition"
                    >
                        🏠 Back to Homepage
                    </button>
                </div>
            </div>
        </AdminGuard>
    );
}
