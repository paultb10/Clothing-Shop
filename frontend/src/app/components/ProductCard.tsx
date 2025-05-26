'use client';

import Link from 'next/link';

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrls: string[];
    sizes: string[];
};

type ProductCardProps = {
    product: Product;
    wishlistIds: number[];
    onAddToWishlist: (id: number) => void;
};

export default function ProductCard({ product, wishlistIds, onAddToWishlist }: ProductCardProps) {
    const isWished = wishlistIds.includes(product.id);

    return (
        <div className="relative bg-white border rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 group">
            {/* Wishlist Button */}
            <button
                onClick={() => !isWished && onAddToWishlist(product.id)}
                disabled={isWished}
                aria-label={isWished ? 'Already in Wishlist' : 'Add to Wishlist'}
                className={`absolute top-2 right-2 z-10 p-2 rounded-full shadow backdrop-blur-sm transition ${
                    isWished
                        ? 'text-pink-400 bg-white/80 cursor-not-allowed'
                        : 'hover:text-pink-600 text-pink-500 bg-white/70'
                }`}
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
           2 5.41 4.42 3 7.5 3c1.74 0 3.41.81
           4.5 2.09C13.09 3.81 14.76 3 16.5 3
           19.58 3 22 5.41 22 8.5c0 3.78-3.4
           6.86-8.55 11.54L12 21.35z" />
                </svg>
            </button>

            <Link href={`/product/${product.id}`} className="block">
                <div className="aspect-square bg-white flex items-center justify-center overflow-hidden">
                    <img
                        src={product.imageUrls[0] || 'https://via.placeholder.com/300?text=No+Image'}
                        alt={product.name}
                        className="object-contain w-full h-full p-2 transition-transform duration-300 transform group-hover:scale-105"
                    />
                </div>

                <div className="p-4 space-y-2">
                    <h2 className="text-lg font-bold text-gray-800 truncate">{product.name}</h2>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-blue-600">${product.price}</span>
                        <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                                product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                        >
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
                    </div>

                    {product.sizes.length > 0 && (
                        <div className="flex gap-1 flex-wrap max-h-[3.2rem] overflow-hidden">
                            {product.sizes.slice(0, 8).map((size) => (
                                <span
                                    key={size}
                                    className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full"
                                >
                  {size}
                </span>
                            ))}
                            {product.sizes.length > 8 && (
                                <span className="text-xs text-gray-400">+{product.sizes.length - 8}</span>
                            )}
                        </div>
                    )}
                </div>
            </Link>
        </div>
    );
}
