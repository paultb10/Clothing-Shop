'use client';

import { useEffect, useState } from 'react';
import AdminGuard from "@/app/components/AdminGuard";

type Order = {
    id: number;
    userId: string;
    totalAmount: number;
    shippingAddress: string;
    status: string;
    createdAt: string;
};

const statusOptions = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [userNames, setUserNames] = useState<Record<string, string>>({});
    const [adminId, setAdminId] = useState<string | null>(null);

    useEffect(() => {
        const role = localStorage.getItem('role');
        const id = localStorage.getItem('userId');

        if (!role || !id) {
            alert("❌ Missing user info in localStorage. Please login again.");
            return;
        }

        if (role.toUpperCase() !== 'ADMIN') {
            alert("❌ Unauthorized. Only admins can access this page.");
            return;
        }

        setAdminId(id);

        fetch('http://localhost:8084/api/orders/admin/orders', {
            headers: { 'X-User-Id': id }
        })
            .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch orders."))
            .then(async (orders: Order[]) => {
                setOrders(orders);

                const uniqueUserIds = [...new Set(orders.map(o => o.userId))];
                const nameMap: Record<string, string> = {};

                await Promise.all(uniqueUserIds.map(async userId => {
                    try {
                        const res = await fetch(`http://localhost:8080/api/users/${userId}`);
                        if (!res.ok) throw new Error();
                        const user = await res.json();
                        nameMap[userId] = `${user.firstName} ${user.lastName}`;
                    } catch {
                        nameMap[userId] = 'Unknown User';
                    }
                }));

                setUserNames(nameMap);
            })
            .catch(err => {
                console.error(err);
                alert("❌ Error loading orders. See console.");
            });
    }, []);

    const updateStatus = async (orderId: number, status: string) => {
        if (!adminId) return;

        const res = await fetch(`http://localhost:8084/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': adminId
            },
            body: JSON.stringify({ status })
        });

        if (res.ok) {
            const updated = await res.json();
            setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        } else {
            alert('Failed to update status');
        }
    };

    const getStatusBadgeClass = (status: string) => {
        const base = "inline-block px-2 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case "PENDING": return `${base} bg-yellow-100 text-yellow-800`;
            case "CONFIRMED": return `${base} bg-blue-100 text-blue-800`;
            case "SHIPPED": return `${base} bg-purple-100 text-purple-800`;
            case "DELIVERED": return `${base} bg-green-100 text-green-800`;
            case "CANCELLED": return `${base} bg-red-100 text-red-800`;
            default: return base;
        }
    };

    return (
        <AdminGuard>
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => window.location.href = '/homepage'}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow transition"
                    aria-label="Go to homepage"
                >
                    🏠 Back to Homepage
                </button>
            </div>
            <h1 className="text-3xl font-bold mb-6">📋 Admin Order Management</h1>

            <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-200 text-gray-700 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3 text-left">Order ID</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Total</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.map(order => (
                        <tr key={order.id} className="border-t hover:bg-gray-50 transition">
                            <td className="px-4 py-3">{order.id}</td>
                            <td className="px-4 py-3 font-medium">{userNames[order.userId] || order.userId}</td>
                            <td className="px-4 py-3 text-blue-600 font-semibold">${order.totalAmount.toFixed(2)}</td>
                            <td className="px-4 py-3">
                                    <span className={getStatusBadgeClass(order.status)}>
                                        {order.status}
                                    </span>
                            </td>
                            <td className="px-4 py-3">
                                <select
                                    value={order.status}
                                    onChange={e => updateStatus(order.id, e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                                >
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
        </AdminGuard>
    );
}
