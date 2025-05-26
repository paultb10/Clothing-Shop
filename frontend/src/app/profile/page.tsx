'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    role: string;
};

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

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [orders, setOrders] = useState<Order[]>([]);
    const [productsMap, setProductsMap] = useState<Record<number, Product>>({});

    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    useEffect(() => {
        if (!userId || !token) return;

        fetch(`http://localhost:8080/api/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch user');
                return res.json();
            })
            .then((data: User) => {
                setUser(data);
                setFormData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching user:', err);
                setLoading(false);
            });
    }, [userId, token]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        if (!userId || !token) return;

        setSaving(true);
        setSuccessMessage('');
        try {
            const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error('Failed to update profile');
            const updatedUser = await res.json();
            setUser(updatedUser);
            setSuccessMessage('✅ Profile updated successfully!');
        } catch (error) {
            console.error('Update error:', error);
            alert('❌ Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500 animate-pulse">Loading profile...</div>;
    }

    if (!user) {
        return <div className="p-6 text-center text-red-500">User not found or not logged in.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10 space-y-12">
            {/* Profile Section */}
            <div className="bg-white shadow-lg rounded-xl p-6 space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-900">👤 Profile Overview</h1>

                {successMessage && (
                    <div className="p-4 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                        {successMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {['firstName', 'lastName', 'email', 'address'].map((field) => (
                        <div key={field}>
                            <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize mb-1">
                                {field}
                            </label>
                            <input
                                id={field}
                                name={field}
                                value={formData[field as keyof User] || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder={`Enter your ${field}`}
                            />
                        </div>
                    ))}

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input
                            value={user.role}
                            disabled
                            className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className={`w-full py-2 px-4 rounded-md text-white font-semibold transition ${
                        saving ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Orders Section */}
            {orders.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">📦 Order History</h2>
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white border shadow-sm rounded-lg p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-lg font-semibold">Order #{order.id}</p>
                                    <span className="text-sm capitalize text-blue-600 font-medium">
                                    {order.status.toLowerCase()}
                                </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-4">Total: ${order.totalAmount}</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {order.items.map(item => {
                                        const product = productsMap[item.productId];
                                        if (!product) return null;

                                        return (
                                            <Link
                                                key={item.id}
                                                href={`/product/${product.id}`}
                                                className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 border rounded-lg hover:shadow-md transition"
                                            >
                                                <div className="w-full sm:w-28 h-28 overflow-hidden rounded-md">
                                                    <img
                                                        src={product.imageUrls?.[0] || 'https://via.placeholder.com/150'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-grow text-center sm:text-left space-y-1">
                                                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                    <p className="text-md font-bold text-blue-700">${item.price}</p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

}
