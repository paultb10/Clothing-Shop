'use client';

import { useState } from 'react';
import NavBar from './components/NavBar'; // adjust the path if needed

export default function Home() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  return (
      <>
        <NavBar
            cartCount={1}
            wishlistCount={2}
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
        />

        {/* Sample: You can now use search, sort, categoryId to render product grid */}
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Search Results</h1>
          <p className="text-sm text-gray-500">Search: {search}</p>
          <p className="text-sm text-gray-500">Sort: {sort}</p>
          <p className="text-sm text-gray-500">Category: {categoryId ?? 'All'}</p>
        </div>
      </>
  );
}
