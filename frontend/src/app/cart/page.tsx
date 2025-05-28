'use client';

import { useEffect, useState } from 'react';

type CartItem = { id: number; productId: number; quantity: number; size: string };
type Cart = { id: number; userId: string; items: CartItem[] };
type Product = { id: number; name: string; description: string; price: number; imageUrls: string[]; stock: number };
type CartDisplayItem = { cartItemId: number; product: Product; quantity: number; size: string };

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartDisplayItem[]>([]);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [promoCode, setPromoCode] = useState('');
    const [promoResult, setPromoResult] = useState<string | null>(null);
    const [discount, setDiscount] = useState<number>(0);
    const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED' | null>(null);
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || 'guest' : 'guest';
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';

    const fetchCartItems = async () => {
        try {
            const res = await fetch(`http://localhost:8082/cart/${userId}`);
            const cart: Cart = await res.json();
            const items = await Promise.all(
                cart.items.map(async item => {
                    const res = await fetch(`http://localhost:8081/products/${item.productId}`);
                    const product = await res.json();
                    return {cartItemId: item.id, product, quantity: item.quantity, size: item.size};
                })
            );
            setCartItems(items);
            const qMap: Record<number, number> = {};
            items.forEach(item => (qMap[item.cartItemId] = item.quantity));
            setQuantities(qMap);
        } catch (err) {
            console.error('Failed to load cart:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    const handleRemove = async (productId: number, size: string) => {
        const res = await fetch(`http://localhost:8082/cart/${userId}/remove?productId=${productId}&size=${encodeURIComponent(size)}`, {
            method: 'DELETE',
        });
        res.ok ? (fetchCartItems(), window.dispatchEvent(new Event('cart-updated'))) : alert('❌ Failed to remove item');
    };

    const handleClearCart = async () => {
        const res = await fetch(`http://localhost:8082/cart/${userId}/clear`, {method: 'DELETE'});
        res.ok ? (setCartItems([]), window.dispatchEvent(new Event('cart-updated'))) : alert('❌ Failed to clear cart');
    };

    const handleQuantityBlur = async (productId: number, size: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        const res = await fetch(`http://localhost:8082/cart/${userId}/update?productId=${productId}&quantity=${newQuantity}&size=${encodeURIComponent(size)}`, {
            method: 'PUT',
        });
        res.ok ? window.dispatchEvent(new Event('cart-updated')) : alert('❌ Failed to update quantity');
    };

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setPromoResult('Validating promo...');

        try {
            const res = await fetch('http://localhost:8085/api/promos/validate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: userEmail, code: promoCode}),
            });

            const data = await res.json();

            if (res.ok) {
                setPromoResult(`✅ ${data.message}`);
                setDiscountType(data.type);

                if (data.type === 'PERCENTAGE') {
                    setDiscount(data.discount / 100);
                } else if (data.type === 'FIXED') {
                    setDiscount(data.discount);
                }

                localStorage.setItem('promoCode', promoCode);
            } else {
                setPromoResult(`❌ ${data.message}`);
                setDiscount(0);
                setDiscountType(null);
            }
        } catch (err) {
            console.error(err);
            setPromoResult('❌ Failed to validate promo.');
            setDiscount(0);
            setDiscountType(null);
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * (quantities[item.cartItemId] || 1), 0);
    const total = discountType === 'PERCENTAGE' ? subtotal * (1 - discount) : discountType === 'FIXED' ? Math.max(0, subtotal - discount) : subtotal;

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">🔄 Loading your cart...</div>;

    if (cartItems.length === 0)
        return <div className="p-8 text-center text-gray-600 text-lg">🛍️ Your cart is empty. <a href="/homepage"
                                                                                                className="text-blue-600 underline">Browse
            products</a>.</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
            <header className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">🛒 Your Shopping Cart</h1>
                <button
                    onClick={handleClearCart}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm shadow-sm"
                >
                    Clear Cart
                </button>
            </header>

            <section className="space-y-6">
                {cartItems.map(({cartItemId, product, size}) => (
                    <div
                        key={cartItemId}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-5 flex flex-col sm:flex-row gap-4"
                    >
                        <img
                            src={product.imageUrls[0] || 'https://via.placeholder.com/150?text=No+Image'}
                            alt={product.name}
                            className="w-28 h-28 object-contain rounded bg-gray-50"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                                <p className="text-sm mt-1">Size: <strong>{size}</strong></p>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-blue-600 font-bold text-lg">${product.price.toFixed(2)}</div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm">Qty:</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={product.stock}
                                        value={quantities[cartItemId] || 1}
                                        onChange={e =>
                                            setQuantities(prev => ({...prev, [cartItemId]: parseInt(e.target.value)}))
                                        }
                                        onBlur={() =>
                                            handleQuantityBlur(product.id, size, quantities[cartItemId])
                                        }
                                        className="w-16 px-2 py-1 border rounded-md text-center"
                                    />
                                    <button
                                        onClick={() => handleRemove(product.id, size)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <section className="bg-gray-50 p-4 rounded-md space-y-4 border">
                <h2 className="text-lg font-semibold text-gray-700">🎟️ Promo Code</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                        className="border px-3 py-2 rounded-md w-full"
                    />
                    <button
                        onClick={handleApplyPromo}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Apply
                    </button>
                </div>
                {promoResult && (
                    <div
                        className={`text-sm font-medium rounded-md px-2 py-1 text-center ${
                            promoResult.startsWith('✅')
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {promoResult}
                    </div>
                )}
                {discount > 0 && (
                    <div className="text-right text-sm text-green-700 font-medium">
                        Discount
                        Applied: {discountType === 'PERCENTAGE' ? `${discount * 100}%` : `$${discount.toFixed(2)}`}
                    </div>
                )}
            </section>

            <section className="text-right text-xl font-bold text-gray-800 border-t pt-6">
                Total: <span className="ml-2 text-blue-700">${total.toFixed(2)}</span>
            </section>

            <div className="sticky bottom-0 bg-white border-t py-4 px-4 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-end">
                    <button
                        onClick={() => window.location.href = '/checkout'}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all duration-300 text-lg"
                    >
                        🧾 Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}