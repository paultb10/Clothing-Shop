'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type OrderItem = {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    size: string;
};

type Order = {
    id: number;
    totalAmount: number;
    shippingAddress: string;
    status: string;
    items: OrderItem[];
};

type Product = {
    id: number;
    name: string;
    price: number;
    imageUrls: string[];
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [productsMap, setProductsMap] = useState<Record<number, Product>>({});
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    useEffect(() => {
        if (!userId) return;

        const fetchOrders = async () => {
            try {
                const res = await fetch(`http://localhost:8084/api/orders/${userId}`, {
                    headers: { 'X-User-Id': userId },
                });
                const data: Order[] = await res.json();
                setOrders(data);

                const productIds = new Set<number>();
                data.forEach(order => order.items.forEach(item => productIds.add(item.productId)));

                const fetchedProducts: Record<number, Product> = {};
                await Promise.all(
                    Array.from(productIds).map(async (id) => {
                        const res = await fetch(`http://localhost:8081/products/${id}`);
                        if (res.ok) {
                            const product = await res.json();
                            fetchedProducts[id] = product;
                        }
                    })
                );
                setProductsMap(fetchedProducts);
            } catch (err) {
                console.error('❌ Failed to fetch orders or products', err);
            }
        };

        fetchOrders();
    }, [userId]);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Link
                href="/homepage"
                className="inline-block mb-4 text-blue-600 hover:text-blue-800 font-medium transition"
            >
                ← Back to Homepage
            </Link>
            <h1 className="text-2xl font-bold mb-6">📦 Your Orders</h1>
            {orders.length === 0 ? (
                <p className="text-gray-500">No orders found.</p>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-xl p-6 mb-8 bg-white shadow-sm">
                        <div className="mb-4">
                            <p className="font-semibold text-lg text-gray-800">
                                Order #{order.id} – <span
                                className="capitalize text-gray-600">{order.status.toLowerCase()}</span>
                            </p>
                            <p className="text-sm text-gray-500">Total: ${order.totalAmount.toFixed(2)}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {order.items.map(item => {
                                const product = productsMap[item.productId];
                                if (!product) return null;

                                return (
                                    <Link
                                        key={item.id}
                                        href={`/product/${product.id}`}
                                        className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
                                    >
                                        <img
                                            src={product.imageUrls?.[0] || 'https://via.placeholder.com/150'}
                                            alt={product.name}
                                            className="w-20 h-20 object-cover rounded border"
                                        />
                                        <div className="flex flex-col justify-between">
                                            <h3 className="text-base font-medium text-gray-900">{product.name}</h3>
                                            <p className="text-sm text-gray-600">Size: {item.size}</p>
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            <p className="text-md font-semibold text-blue-700 mt-1">${item.price}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="flex justify-end">
                            <Link
                                href={`/order-tracking/${order.id}`}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md transition hover:-translate-y-0.5"
                            >
                                📍 Track Order
                            </Link>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
