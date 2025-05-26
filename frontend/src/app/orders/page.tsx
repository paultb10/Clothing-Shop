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

                // Collect all unique productIds
                const productIds = new Set<number>();
                data.forEach(order => order.items.forEach(item => productIds.add(item.productId)));

                // Fetch product details for all items
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
                    <div key={order.id} className="border p-4 rounded-md mb-6">
                        <p className="font-semibold text-lg mb-2">
                            Order #{order.id} – <span className="capitalize">{order.status.toLowerCase()}</span>
                        </p>
                        <p className="text-sm mb-4">Total: ${order.totalAmount}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {order.items.map(item => {
                                const product = productsMap[item.productId];
                                if (!product) return null;

                                return (
                                    <Link
                                        key={item.id}
                                        href={`/product/${product.id}`}
                                        className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-white hover:shadow transition overflow-hidden"
                                    >
                                        <div className="w-full sm:w-32 h-32 flex-shrink-0">
                                            <img
                                                src={product.imageUrls?.[0] || 'https://via.placeholder.com/150'}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-md border"
                                            />
                                        </div>

                                        <div className="flex flex-col justify-between flex-grow min-w-0">
                                            <h2 className="text-lg font-semibold text-gray-900 truncate">
                                                {product.name}
                                            </h2>
                                            <p className="text-sm text-gray-600 mt-1">Size: {item.size}</p>
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            <p className="text-md font-bold text-blue-700 mt-2">${item.price}</p>
                                        </div>
                                    </Link>

                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
