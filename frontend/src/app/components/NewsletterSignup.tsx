// 📩 Newsletter Subscription UI & API call
import { useState } from 'react';

export default function NewsletterSignup() {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('http://localhost:8085/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!res.ok) throw new Error('Subscription failed');
            setMessage('✅ Successfully subscribed! Check your email for the promo code.');
            setEmail('');
        } catch (err) {
            console.error(err);
            setMessage('❌ Subscription failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubscribe} className="bg-white p-6 rounded-md shadow-md w-full max-w-md mx-auto mt-10 border border-blue-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📬 Subscribe to our Newsletter</h2>
            <p className="text-sm text-gray-500 mb-4">Get exclusive promos & 10% off your first order</p>
            <div className="flex items-center gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-2 border rounded-md shadow-sm"
                />
                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-sm transition"
                >
                    {submitting ? 'Subscribing...' : 'Subscribe'}
                </button>
            </div>
            {message && <p className="mt-3 text-sm text-center text-blue-700">{message}</p>}
        </form>
    );
}
