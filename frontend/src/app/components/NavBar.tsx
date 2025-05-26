'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CategoryItem, CategoryTree, buildCategoryTree } from '@/app/components/categorize';
import {MegaMenu} from "@/app/components/MegaMenu";

type NavBarProps = {
    cartCount: number;
    wishlistCount: number;
    search: string;
    setSearch: (val: string) => void;
    sort: 'asc' | 'desc';
    setSort: (val: 'asc' | 'desc') => void;
    categoryId: number | null;
    setCategoryId: (id: number | null) => void;
};

export default function NavBar({
                                   cartCount, wishlistCount, search, setSearch,
                                   sort, setSort, categoryId, setCategoryId
                               }: NavBarProps) {
    const [input, setInput] = useState(search);
    const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
    const [expandedSubs, setExpandedSubs] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        const handler = setTimeout(() => setSearch(input), 500);
        return () => clearTimeout(handler);
    }, [input]);

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('http://localhost:8081/categories');
            const categories: CategoryItem[] = await res.json();
            setCategoryTree(buildCategoryTree(categories));
        }
        fetchData();
    }, []);


    return (
        <nav className="bg-black text-white w-full shadow-md px-4 py-3 sticky top-0 z-50">
            <div className="flex items-start justify-between w-full">
                {/* LEFT: MegaMenu */}
                <div className="flex-1">
                    <MegaMenu
                        categories={categoryTree}
                        categoryId={categoryId}
                        setCategoryId={setCategoryId}
                    />
                </div>

                {/* CENTER: Logo */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <div className="text-2xl font-bold uppercase text-center">Pravalia lui Paul</div>
                </div>

                {/* RIGHT: Icons and Filters */}
                <div className="w-1/4 flex flex-col items-end space-y-4">
                    {/* Top Row: Icons */}
                    <div className="flex gap-4 items-center">
                        <Link href="/wishlist" className="relative">❤️
                            {wishlistCount > 0 && (
                                <span
                                    className="absolute -top-1 -right-2 bg-pink-500 text-white text-xs px-1.5 rounded-full">{wishlistCount}</span>
                            )}
                        </Link>
                        <Link href="/cart" className="relative">🛒
                            {cartCount > 0 && (
                                <span
                                    className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">{cartCount}</span>
                            )}
                        </Link>
                        <Link href="/profile">👤</Link>
                    </div>

                    {/* Bottom Row: Filters */}
                    <div className="flex gap-2 items-center">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Search products..."
                            aria-label="Search"
                            className="px-3 py-2 rounded-md text-black w-48"
                        />
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as 'asc' | 'desc')}
                            className="text-black px-2 py-1 rounded-md"
                        >
                            <option value="asc">Low → High</option>
                            <option value="desc">High → Low</option>
                        </select>
                    </div>
                </div>

            </div>
        </nav>
    );
}
