'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuard from "@/app/components/AdminGuard";

type ProductForm = {
    name: string;
    description: string;
    price: string;
    stock: string;
    image: File | null;
    sizesInput: string[];
    categoryId: number;
    tagIds: number[];
    brandId: number;
};

type Brand = { id: number; name: string };
type Category = { id: number; name: string; parentId?: number | null };
type Tag = { id: number; name: string };

export default function AddProductPage() {
    const [form, setForm] = useState<ProductForm>({
        name: '',
        description: '',
        price: '',
        stock: '',
        image: null,
        sizesInput: [],
        categoryId: 0,
        tagIds: [],
        brandId: 0,
    });

    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<{ id: number; label: string }[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const buttonStyle = "inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow transition-all duration-200";

    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setTagDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const buildCategoryPath = (cat: Category, all: Category[]): string => {
        const parent = all.find(c => c.id === cat.parentId);
        return parent ? `${buildCategoryPath(parent, all)} > ${cat.name}` : cat.name;
    };

    useEffect(() => {
        fetch('http://localhost:8081/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                const options = data.map((cat: Category) => ({
                    id: cat.id,
                    label: buildCategoryPath(cat, data),
                }));
                setCategoryOptions(options);
            });

        fetch('http://localhost:8081/tags')
            .then(res => res.json())
            .then(setTags);

        fetch('http://localhost:8081/api/brands')
            .then(res => res.json())
            .then(setBrands);
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, image: e.target.files?.[0] || null }));
    };

    const handleSizeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const input = (e.target as HTMLInputElement).value.trim();
            if (input && !form.sizesInput.includes(input)) {
                setForm(prev => ({ ...prev, sizesInput: [...prev.sizesInput, input] }));
                (e.target as HTMLInputElement).value = '';
            }
        }
    };

    const removeSize = (size: string) => {
        setForm(prev => ({ ...prev, sizesInput: prev.sizesInput.filter(s => s !== size) }));
    };

    const handleSubmit = async () => {
        if (!form.image) return setMessage('Please select an image.');
        setUploading(true);
        setMessage('');

        try {
            const base64 = await toBase64(form.image);
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: base64 }),
            });
            const { url } = await uploadRes.json();

            const productPayload = {
                name: form.name,
                description: form.description,
                price: parseFloat(form.price),
                stock: parseInt(form.stock, 10),
                imageUrls: [url],
                sizes: form.sizesInput,
                categoryId: Number(form.categoryId),
                tagIds: form.tagIds,
                brand: { id: form.brandId },
            };

            const res = await fetch('http://localhost:8081/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productPayload),
            });

            if (!res.ok) throw new Error('Failed to save product');
            setMessage('✅ Product created successfully!');
        } catch (err) {
            console.error(err);
            setMessage('❌ Failed to create product.');
        } finally {
            setUploading(false);
        }
    };

    const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });

    return (
        <AdminGuard>
        <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">🛍️ Add New Product</h1>

            {/* Product Basics */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">📋 Basic Information</h2>
                <label className="block mb-2 text-sm font-medium text-gray-700">Product Name</label>
                <input name="name" className="input-field" value={form.name} onChange={handleChange}
                       placeholder="e.g. Cotton T-shirt"/>

                <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" className="input-field" value={form.description} onChange={handleChange}
                          rows={4} placeholder="Enter a product description..."/>
            </section>

            {/* Inventory Section */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">📦 Inventory Details</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Price ($)</label>
                        <input name="price" type="number" className="input-field" value={form.price}
                               onChange={handleChange} placeholder="e.g. 19.99"/>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Stock Quantity</label>
                        <input name="stock" type="number" className="input-field" value={form.stock}
                               onChange={handleChange} placeholder="e.g. 50"/>
                    </div>
                </div>
            </section>

            {/* Classification Section */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">📁 Classification</h2>

                <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
                <select name="categoryId" className="input-field" value={form.categoryId} onChange={handleChange}>
                    <option value={0}>Select a category</option>
                    {categoryOptions.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                </select>

                <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Tags</label>
                <select
                    name="tagIds"
                    multiple
                    className="input-field h-32"
                    value={form.tagIds.map(String)}
                    onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
                        setForm(prev => ({...prev, tagIds: selected}));
                    }}
                >
                    {tags.map(tag => (
                        <option key={tag.id} value={tag.id}>{tag.name}</option>
                    ))}
                </select>

                <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Sizes</label>
                <div className="input-field flex flex-wrap gap-2 items-center">
                    {form.sizesInput.map(size => (
                        <span key={size}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                          {size}
                            <button onClick={() => removeSize(size)}
                                    className="ml-2 text-red-600 hover:text-red-800">&times;</button>
                        </span>
                    ))}
                    <input onKeyDown={handleSizeInput} className="flex-1 outline-none"
                           placeholder="Type and press enter..."/>
                </div>

                <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Brand</label>
                <select
                    name="brandId"
                    className="input-field"
                    value={form.brandId}
                    onChange={handleChange}
                >
                    <option value={0}>Select a brand</option>
                    {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                </select>
            </section>

            {/* Image Upload */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">🖼️ Product Image</h2>
                <input type="file" accept="image/*" onChange={handleImageChange} className="input-field"/>
                {form.image && (
                    <img src={URL.createObjectURL(form.image)} alt="Preview"
                         className="mt-4 rounded shadow max-h-64 object-contain"/>
                )}
            </section>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={uploading}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
                {uploading ? 'Uploading...' : 'Create Product'}
            </button>

            {message && (
                <p className={`text-center mt-4 font-medium ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}

            <div className="flex justify-center gap-6 mt-10">
                <button
                    onClick={() => router.push('/admin_order')}
                    className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-5 rounded-lg shadow transition-all duration-200"
                    aria-label="Manage Orders"
                >
                    📦 Manage Orders
                </button>
                <button
                    onClick={() => router.push('/homepage')}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow transition-all duration-200"
                    aria-label="Go to Homepage"
                >
                    🏠 Homepage
                </button>
            </div>
        </div>
        </AdminGuard>
    );
}
