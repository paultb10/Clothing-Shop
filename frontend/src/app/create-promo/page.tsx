'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuard from "@/app/components/AdminGuard";

export default function CreatePromoPage() {
    const [code, setCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
    const [oneTimeUse, setOneTimeUse] = useState(false);
    const [expiresAt, setExpiresAt] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const router = useRouter();

    const handleCreate = async () => {
        setMessage('');
        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:8085/api/promos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, discount, type, oneTimeUse, expiresAt, usedByUsers: [] }),
            });
            if (!res.ok) throw new Error('Failed to create promo');
            setMessage('✅ Promo code created successfully.');
        } catch (err: any) {
            setMessage('❌ ' + (err.message || 'Error creating promo'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminGuard>
            <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg space-y-6 border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 text-center">🎁 Create a Promo Code</h1>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                            Promo Code
                        </label>
                        <input
                            id="code"
                            className="mt-1 border w-full p-2 rounded focus:ring focus:ring-blue-200"
                            placeholder="e.g. SUMMER2025"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                            Discount Amount
                        </label>
                        <input
                            id="discount"
                            type="number"
                            className="mt-1 border w-full p-2 rounded focus:ring focus:ring-blue-200"
                            placeholder="e.g. 20"
                            value={discount}
                            onChange={e => setDiscount(Number(e.target.value))}
                        />
                    </div>

                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Discount Type
                        </label>
                        <select
                            id="type"
                            className="mt-1 border w-full p-2 rounded focus:ring focus:ring-blue-200"
                            value={type}
                            onChange={e => setType(e.target.value as any)}
                        >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount ($)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="oneTimeUse"
                            type="checkbox"
                            checked={oneTimeUse}
                            onChange={e => setOneTimeUse(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="oneTimeUse" className="text-sm text-gray-700">
                            One-time use only
                        </label>
                    </div>

                    <div>
                        <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
                            Expiry Date & Time
                        </label>
                        <input
                            id="expiresAt"
                            type="datetime-local"
                            className="mt-1 border w-full p-2 rounded focus:ring focus:ring-blue-200"
                            value={expiresAt}
                            onChange={e => setExpiresAt(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2 rounded font-semibold transition"
                >
                    ➕ {submitting ? 'Creating...' : 'Create Promo'}
                </button>

                {message && (
                    <div
                        className={`text-center text-sm mt-4 p-2 rounded ${
                            message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {message}
                    </div>
                )}

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
