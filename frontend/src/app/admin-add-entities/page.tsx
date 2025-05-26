'use client';

import { useEffect, useState } from 'react';

type Category = {
    id: number;
    name: string;
    parentId: number | null;
};

export default function AddEntitiesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryName, setCategoryName] = useState('');
    const [parentCategoryId, setParentCategoryId] = useState('');
    const [brandName, setBrandName] = useState('');
    const [tagName, setTagName] = useState('');
    const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('http://localhost:8081/categories');
                if (!res.ok) throw new Error('Failed to fetch categories');
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
    }, []);

    const showStatus = (message: string, type: 'success' | 'error') => {
        setStatus({ message, type });
        setTimeout(() => setStatus(null), 3500);
    };

    const handleSubmit = async (e: React.FormEvent, type: 'category' | 'brand' | 'tag') => {
        e.preventDefault();
        setLoading(true);

        let url = '';
        let body = {};

        switch (type) {
            case 'category':
                url = 'http://localhost:8081/categories';
                body = { name: categoryName, parentId: parentCategoryId || null };
                break;
            case 'brand':
                url = 'http://localhost:8081/api/brands';
                body = { name: brandName };
                break;
            case 'tag':
                url = 'http://localhost:8081/tags';
                body = { name: tagName };
                break;
        }

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error();
            showStatus(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`, 'success');

            if (type === 'category') {
                setCategoryName('');
                setParentCategoryId('');
            } else if (type === 'brand') setBrandName('');
            else setTagName('');
        } catch {
            showStatus(`Error adding ${type}.`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = 'w-full px-4 py-2 border border-blue-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400';
    const buttonStyles = 'w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-2 rounded hover:opacity-90 transition duration-200';

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-8">
            <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                🌊 Add Entities – Admin Panel
            </h1>

            {status && (
                <div
                    className={`text-white p-4 rounded-lg text-center ${
                        status.type === 'success' ? 'bg-blue-500' : 'bg-red-500'
                    }`}
                >
                    {status.message}
                </div>
            )}

            {/* Category Form */}
            <form onSubmit={(e) => handleSubmit(e, 'category')} className="bg-white shadow-lg p-6 rounded-lg space-y-4 border border-blue-100">
                <h2 className="text-xl font-semibold text-blue-600">👕 Add a Category</h2>
                <input
                    className={inputStyles}
                    placeholder="Category Name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                />
                <select
                    className={inputStyles}
                    value={parentCategoryId}
                    onChange={(e) => setParentCategoryId(e.target.value)}
                >
                    <option value="">No Parent</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <button type="submit" disabled={loading} className={buttonStyles}>
                    {loading ? 'Adding...' : 'Add Category'}
                </button>
            </form>

            {/* Brand Form */}
            <form onSubmit={(e) => handleSubmit(e, 'brand')} className="bg-white shadow-lg p-6 rounded-lg space-y-4 border border-blue-100">
                <h2 className="text-xl font-semibold text-blue-600">🏷️ Add a Brand</h2>
                <input
                    className={inputStyles}
                    placeholder="Brand Name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading} className={buttonStyles}>
                    {loading ? 'Adding...' : 'Add Brand'}
                </button>
            </form>

            {/* Tag Form */}
            <form onSubmit={(e) => handleSubmit(e, 'tag')} className="bg-white shadow-lg p-6 rounded-lg space-y-4 border border-blue-100">
                <h2 className="text-xl font-semibold text-blue-600">👟 Add a Tag</h2>
                <input
                    className={inputStyles}
                    placeholder="Tag Name"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading} className={buttonStyles}>
                    {loading ? 'Adding...' : 'Add Tag'}
                </button>
            </form>
        </div>
    );
}
