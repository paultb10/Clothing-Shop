'use client';

import Link from 'next/link';

export default function AdminTools() {
    return (
        <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 Admin Tools</h2>
            <div className="flex gap-4 flex-wrap justify-center sm:justify-start">
                <AdminLink href="/add-product" color="green" label="➕ Add New Product" />
                <AdminLink href="/admin-add-entities" color="yellow" label="➕ Add New Entities" />
                <AdminLink href="/admin_order" color="blue" label="📦 Manage Orders" />
                <AdminLink href="/create-promo" color="indigo" label="🎁 Create Promo" />
                <AdminLink href="/validate-promo" color="purple" label="✅ Validate Promo" />
                <AdminLink href="/analytics" color="red" label="📊 View Analytics" />
            </div>
        </section>
    );
}

const colorClasses: Record<string, string> = {
    green: 'bg-green-600 hover:bg-green-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    red: 'bg-red-600 hover:bg-red-700',
};

function AdminLink({ href, color, label }: { href: string; color: string; label: string }) {
    const colorClass = colorClasses[color] || 'bg-gray-600 hover:bg-gray-700';

    return (
        <Link
            href={href}
            className={`inline-block px-5 py-3 ${colorClass} text-white rounded-md shadow transition font-medium`}
        >
            {label}
        </Link>
    );
}
