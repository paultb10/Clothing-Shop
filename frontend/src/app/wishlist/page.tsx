'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrls: string[];
    stock: number;
    sizes: string[];
};

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<number[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || 'guest' : 'guest';

    useEffect(() => {
        fetch(`http://localhost:8083/wishlist/${userId}`)
            .then(res => res.json())
            .then(data => setWishlist(data.productIds || []))
            .catch(console.error);
    }, [userId]);

    useEffect(() => {
        if (wishlist.length === 0) return setProducts([]);
        Promise.all(wishlist.map(id => fetch(`http://localhost:8081/products/${id}`).then(res => res.json())))
            .then(setProducts)
            .catch(console.error);
    }, [wishlist]);

    const removeFromWishlist = async (productId: number) => {
        try {
            await fetch(`http://localhost:8083/wishlist/${userId}/remove?productId=${productId}`, { method: 'DELETE' });
            setWishlist(wishlist.filter(id => id !== productId));
        } catch (err) {
            console.error('Error removing from wishlist', err);
        }
    };

    const addToCart = async (productId: number) => {
        const size = selectedSizes[productId];
        if (!size) return alert('Please select a size first!');
        try {
            await fetch(`http://localhost:8082/cart/${userId}/add?productId=${productId}&size=${encodeURIComponent(size)}&quantity=1`, {
                method: 'POST'
            });
            alert('🛒 Added to cart!');
            window.dispatchEvent(new Event('cart-updated'));
        } catch (err) {
            console.error('Failed to add to cart', err);
        }
    };

    const handleSizeChange = (productId: number, size: string) => {
        setSelectedSizes(prev => ({ ...prev, [productId]: size }));
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">💖 My Wishlist</h1>

            {products.length === 0 ? (
                <p className="text-center text-gray-500">Your wishlist is empty. Start exploring our <Link href="/homepage" className="text-blue-600 hover:underline">catalog</Link>!</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(product => (
                        <div key={product.id}
                             className="group bg-white shadow-md rounded-lg overflow-hidden border hover:shadow-lg transition duration-300 flex flex-col">
                            <Link href={`/product/${product.id}`}>
                                <div
                                    className="aspect-square bg-white flex items-center justify-center overflow-hidden">
                                    <img
                                        src={product.imageUrls[0] || 'https://via.placeholder.com/300?text=No+Image'}
                                        alt={product.name}
                                        className="object-contain w-full h-full p-2 transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            </Link>

                            <div className="p-4 flex flex-col flex-1">
                                <Link href={`/product/${product.id}`}>
                                    <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.name}</h2>
                                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                                </Link>
                                <div className="mt-auto pt-2 text-blue-600 font-bold">${product.price}</div>

                                <select
                                    value={selectedSizes[product.id] || ''}
                                    onChange={e => handleSizeChange(product.id, e.target.value)}
                                    className="mt-3 border rounded w-full p-2 text-sm text-gray-700"
                                >
                                    <option value="">Select size</option>
                                    {product.sizes.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>

                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => addToCart(product.id)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition"
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => removeFromWishlist(product.id)}
                                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 px-4 rounded text-sm transition"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
