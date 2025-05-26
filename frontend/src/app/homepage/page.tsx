'use client';

import { useEffect, useState } from 'react';

import NewsletterSignup from '@/app/components/NewsletterSignup';
import SkeletonCard from "@/app/components/SkeletonCard";
import NavBar from "@/app/components/NavBar";
import AdminTools from "@/app/components/AdminTools";
import ProductCard from "@/app/components/ProductCard";

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrls: string[];
    sizes: string[];
    categoryId: number;
    tagIds: number[];
};

type Category = {
    id: number;
    name: string;
    parentId?: number | null;
};

export default function Homepage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'asc' | 'desc'>('asc');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [tagIds, setTagIds] = useState<number[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<{ id: number; label: string }[]>([]);
    const [wishlistIds, setWishlistIds] = useState<number[]>([]);
    const [cartCount, setCartCount] = useState<number>(0);
    const [wishlistCount, setWishlistCount] = useState<number>(0);
    const [isAdmin, setIsAdmin] = useState(false);

    const buildCategoryPath = (cat: Category, all: Category[]): string => {
        const parent = all.find(c => c.id === cat.parentId);
        return parent ? `${buildCategoryPath(parent, all)} > ${cat.name}` : cat.name;
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('role');
            setIsAdmin(role === 'ADMIN');
        }

        fetch('http://localhost:8081/categories')
            .then(res => res.json())
            .then((data: Category[]) => {
                const options = data.map(cat => ({
                    id: cat.id,
                    label: buildCategoryPath(cat, data)
                }));
                setCategoryOptions(options);
            });
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.append('name', search);
        if (categoryId !== null) params.append('categoryId', categoryId.toString());
        if (tagIds.length > 0) tagIds.forEach(tag => params.append('tagIds', tag.toString()));
        if (sort) params.append('sort', sort);

        setLoading(true);
        fetch(`http://localhost:8081/products/filter?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setProducts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [search, sort, categoryId, tagIds]);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const fetchCartCount = async () => {
            const res = await fetch(`http://localhost:8082/cart/${userId}`);
            const cart = await res.json();
            const items = cart.items || [];
            setCartCount(items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0));
        };

        const fetchWishlistData = async () => {
            const res = await fetch(`http://localhost:8083/wishlist/${userId}`);
            const data = await res.json();
            setWishlistCount((data.productIds || []).length);
            setWishlistIds(data.productIds || []);
        };

        fetchCartCount();
        fetchWishlistData();

        const cartHandler = () => fetchCartCount();
        const wishlistHandler = () => fetchWishlistData();

        window.addEventListener('cart-updated', cartHandler);
        window.addEventListener('wishlist-updated', wishlistHandler);
        return () => {
            window.removeEventListener('cart-updated', cartHandler);
            window.removeEventListener('wishlist-updated', wishlistHandler);
        };
    }, []);

    const addToWishlist = async (productId: number) => {
        if (wishlistIds.includes(productId)) {
            alert('This product is already in your wishlist.');
            return;
        }
        const userId = localStorage.getItem('userId');
        if (!userId) return alert('Please log in to use wishlist');

        await fetch(`http://localhost:8083/wishlist/${userId}/add?productId=${productId}`, {
            method: 'POST'
        });
        alert('Added to wishlist!');
        window.dispatchEvent(new Event('wishlist-updated'));
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <NavBar
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                search={search}
                setSearch={setSearch}
                sort={sort}
                setSort={setSort}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
            />
            <main className="p-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Available Products</h1>
                {isAdmin && <AdminTools />}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                wishlistIds={wishlistIds}
                                onAddToWishlist={addToWishlist}
                            />
                        ))}
                    </div>
                )}
                <div className="mt-16">
                    <NewsletterSignup />
                </div>
            </main>
        </div>
    );
}
