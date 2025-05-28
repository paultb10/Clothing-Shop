'use client';

import { useState } from 'react';

export default function OrderCheckoutPage() {
    const [loading, setLoading] = useState(false);
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    const handlePlaceOrder = async () => {
        if (!userId) {
            alert('User not logged in');
            return;
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            alert('Token missing. Please log in again.');
            return;
        }

        setLoading(true);

        try {
            const promoCode = typeof window !== 'undefined' ? localStorage.getItem('promoCode') : null;

            const orderRes = await fetch(`http://localhost:8084/api/orders/${userId}${promoCode ? `?promoCode=${promoCode}` : ''}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId!,
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!orderRes.ok) throw new Error('❌ Failed to place order');
            const order = await orderRes.json();
            console.log('✅ Order placed:', order);

            const stripeRes = await fetch(`http://localhost:8084/api/payments/create-checkout-session/${order.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: order.totalAmount })
            });

            if (!stripeRes.ok) throw new Error('❌ Failed to create checkout session');
            const { url } = await stripeRes.json();

            if (url) {
                localStorage.removeItem('promoCode');
                window.location.href = url;
            } else {
                throw new Error('❌ No redirect URL from Stripe');
            }

        } catch (err: any) {
            console.error(err);
            alert(err.message || '❌ Could not complete the order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 mt-10 text-center space-y-6 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-800">🧾 Review & Pay</h1>
            <p className="text-gray-600">Step 3 of 3: Secure Payment via Stripe</p>
            <p className="text-sm text-gray-500">All transactions are encrypted and PCI-compliant 🔒</p>

            <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className={`w-full flex justify-center items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-md transition-all duration-300 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"></svg>
                        Processing...
                    </>
                ) : (
                    'Place Order & Pay'
                )}
            </button>

            <div className="text-xs text-gray-400 mt-2">Powered by Stripe · Visa · Mastercard · Amex</div>
        </div>
    );
}
