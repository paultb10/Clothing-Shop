'use client';

import { useEffect, useState } from 'react';
import AdminGuard from "@/app/components/AdminGuard";
import AnalyticsCard from "@/app/components/AnalyticsCard";
import ChartBlock from "@/app/components/ChartBlock";

import {
    Chart as ChartJS,
    ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

type UserAnalytics = { totalUsers: number; totalAdmins: number; totalRegularUsers: number; };
type ProductAnalytics = { totalProducts: number; totalCategories: number; totalBrands: number; totalTags: number; };
type OrderAnalytics = { totalOrders: number; totalRevenue: number; ordersByStatus: Record<string, number>; };

export default function AnalyticsPage() {
    const [users, setUsers] = useState<UserAnalytics | null>(null);
    const [products, setProducts] = useState<ProductAnalytics | null>(null);
    const [orders, setOrders] = useState<OrderAnalytics | null>(null);

    useEffect(() => {
        fetch('http://localhost:8087/api/analytics/users').then(res => res.json()).then(setUsers);
        fetch('http://localhost:8087/api/analytics/products').then(res => res.json()).then(setProducts);
        fetch('http://localhost:8087/api/analytics/orders').then(res => res.json()).then(setOrders);
    }, []);

    if (!users || !products || !orders) return <p className="p-4 text-gray-700">Loading analytics...</p>;

    const userChartData = {
        labels: ['Admins', 'Regular Users'],
        datasets: [{ label: 'User Types', data: [users.totalAdmins, users.totalRegularUsers], backgroundColor: ['#3b82f6', '#10b981'] }]
    };

    const orderChartData = {
        labels: Object.keys(orders.ordersByStatus),
        datasets: [{ label: 'Orders by Status', data: Object.values(orders.ordersByStatus), backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'] }]
    };

    const productChartData = {
        labels: ['Products', 'Categories', 'Brands', 'Tags'],
        datasets: [{ label: 'Product Distribution', data: [products.totalProducts, products.totalCategories, products.totalBrands, products.totalTags], backgroundColor: ['#6366f1', '#f43f5e', '#14b8a6', '#eab308'] }]
    };

    return (
        <AdminGuard>
            <div className="p-6 space-y-10">
                <h1 className="text-3xl font-bold">📊 Admin Analytics Dashboard</h1>

                <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
                    <AnalyticsCard title="👤 Users">
                        <p className="text-lg">Total Users: <strong>{users.totalUsers}</strong></p>
                        <ChartBlock type="pie" data={userChartData} />
                    </AnalyticsCard>

                    <AnalyticsCard title="🛍️ Products">
                        <p className="text-lg">Total Products: <strong>{products.totalProducts}</strong></p>
                        <ChartBlock type="bar" data={productChartData} />
                    </AnalyticsCard>

                    <AnalyticsCard title="📦 Orders">
                        <p className="text-lg">Total Orders: <strong>{orders.totalOrders}</strong></p>
                        <p className="text-lg">Total Revenue: <strong className="text-green-600">${orders.totalRevenue.toFixed(2)}</strong></p>
                        <ChartBlock type="bar" data={orderChartData} />
                    </AnalyticsCard>
                </div>
            </div>
        </AdminGuard>
    );
}
