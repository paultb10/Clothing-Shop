'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'react-hot-toast';

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
    const [orders, setOrders] = useState<Order[]>([]);
    const [productsMap, setProductsMap] = useState<Record<number, Product>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<Partial<User>>();

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
                setValue('firstName', data.firstName);
                setValue('lastName', data.lastName);
                setValue('email', data.email);
                setValue('address', data.address);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching user:', err);
                setLoading(false);
            });
    }, [userId, token, setValue]);

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

    const onSubmit = async (data: Partial<User>) => {
        if (!userId || !token) return;

        setSaving(true);
        try {
            const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update profile');
            const updatedUser = await res.json();
            setUser(updatedUser);
            toast.success('✅ Profile updated successfully!');
        } catch (error) {
            console.error('Update error:', error);
            toast.error('❌ Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await fetch('http://localhost:8080/api/auth/logout', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            router.push('/login');
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-500 animate-pulse">
                Loading profile...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6 text-center text-red-500">
                User not found or not logged in.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10 space-y-12">
            <Toaster position="top-right"/>
            {/* Profile Section */}
            <div className="bg-white shadow-lg rounded-xl p-6 space-y-6">
                <div className="flex items-center space-x-4">
                    <div
                        className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-700">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {user.firstName} {user.lastName}
                    </h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                id="firstName"
                                {...register('firstName', {required: 'First name is required'})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter your first name"
                            />
                            {errors.firstName && (
                                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                id="lastName"
                                {...register('lastName', {required: 'Last name is required'})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter your last name"
                            />
                            {errors.lastName && (
                                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                {...register('email', {required: 'Email is required'})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <input
                                id="address"
                                {...register('address', {required: 'Address is required'})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter your address"
                            />
                            {errors.address && (
                                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                            )}
                        </div>

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
                        type="submit"
                        disabled={saving}
                        className={`w-full py-2 px-4 rounded-md text-white font-semibold transition ${
                            saving ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:from-red-600 hover:to-pink-600 transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7"/>
                        </svg>
                        Logout
                    </button>
                </div>
            </div>

            {/* Orders Preview Section */}
            <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 transition-all duration-300 ease-in-out text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center justify-center gap-2">
                    📦 <span>Your Orders</span>
                </h2>
                <p className="text-gray-600 mb-6">Track all your past and current orders in one place.</p>

                <Link
                    href="/orders"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition duration-200 ease-in-out shadow-md hover:shadow-lg"
                >
                    📄 View All Orders
                </Link>
            </div>
        </div>
    );
}
