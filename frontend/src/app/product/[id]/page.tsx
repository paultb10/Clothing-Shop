'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrls: string[];
    sizes: string[];
};

type Review = {
    id: number;
    productId: number;
    userId: string;
    title: string;
    content: string;
    rating: number;
    createdAt: string;
};

type Comment = {
    id: number;
    reviewId: number;
    userId: string;
    content: string;
    createdAt: string;
};

function StarRating({ rating, setRating }: { rating: number; setRating: (n: number) => void }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:scale-125`}
                    aria-label={`${star} star`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}


export default function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [wishlistIds, setWishlistIds] = useState<number[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [comments, setComments] = useState<Record<number, Comment[]>>({});
    const [userNames, setUserNames] = useState<Record<string, string>>({});
    const [reviewRating, setReviewRating] = useState(5);

    useEffect(() => {
        fetch(`http://localhost:8081/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(() => {
                setError('🚫 Oops! Something went wrong. Please try again later.');
                setLoading(false);
            });

        const userId = localStorage.getItem('userId') || 'guest';
        fetch(`http://localhost:8083/wishlist/${userId}`)
            .then(res => res.json())
            .then(data => setWishlistIds(data.productIds || []))
            .catch(console.error);

        fetch(`http://localhost:8086/reviews/product/${id}`)
            .then(res => res.json())
            .then(data => {
                setReviews(data);
                const userIdSet = new Set<string>();

                data.forEach((review: Review) => {
                    userIdSet.add(review.userId);
                    fetch(`http://localhost:8086/comments/review/${review.id}`)
                        .then(res => res.json())
                        .then(c => {
                            setComments(prev => ({ ...prev, [review.id]: c }));
                            c.forEach((comment: Comment) => userIdSet.add(comment.userId));
                        })
                        .catch(console.error);
                });

                userIdSet.forEach(async uid => {
                    if (!userNames[uid]) {
                        try {
                            const res = await fetch(`http://localhost:8080/api/users/${uid}`);
                            if (!res.ok) throw new Error();
                            const user = await res.json();
                            setUserNames(prev => ({ ...prev, [uid]: `${user.firstName} ${user.lastName}` }));
                        } catch {
                            setUserNames(prev => ({ ...prev, [uid]: 'Unknown User' }));
                        }
                    }
                });
            })
            .catch(console.error);
    }, [id]);

    const handleAddToCart = async () => {
        if (!selectedSize) return alert('👟 Please select a size first!');
        const userId = localStorage.getItem('userId');
        if (!userId) return alert('⚠️ Please log in to add items to your cart.');

        const res = await fetch(
            `http://localhost:8082/cart/${userId}/add?productId=${product!.id}&quantity=1&size=${encodeURIComponent(selectedSize)}`,
            { method: 'POST' }
        );

        if (res.ok) {
            alert('✅ Added to cart!');
            window.dispatchEvent(new Event('cart-updated'));
        } else {
            alert('❌ Failed to add to cart');
        }
    };

    const handleAddToWishlist = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return alert('Please log in to use wishlist');
        if (wishlistIds.includes(product!.id)) {
            alert('This product is already in your wishlist.');
            return;
        }

        try {
            const res = await fetch(`http://localhost:8083/wishlist/${userId}/add?productId=${product!.id}`, {
                method: 'POST'
            });
            if (res.ok) {
                alert('❤️ Added to wishlist!');
                window.dispatchEvent(new Event('wishlist-updated'));
                setWishlistIds(prev => [...prev, product!.id]);
            } else {
                alert('❌ Failed to add to wishlist');
            }
        } catch (err) {
            console.error('Failed to add to wishlist', err);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">🔄 Loading product details...</div>;
    if (error || !product) return <div className="p-8 text-center text-red-600">{error || 'Product not found'}</div>;

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">🔄 Loading product details...</div>;
    if (error || !product) return <div className="p-8 text-center text-red-600">{error || 'Product not found'}</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <img
                        src={product.imageUrls[0] || 'https://via.placeholder.com/600x400?text=No+Image'}
                        alt={`Main image of ${product.name}`}
                        className="rounded-xl w-full object-cover shadow-lg"
                    />
                    {product.imageUrls.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pt-2">
                            {product.imageUrls.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Thumbnail ${index + 1} for ${product.name}`}
                                    className="w-20 h-20 object-cover rounded-md border hover:border-blue-500 transition"
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold text-gray-900">{product.name}</h1>
                    <p className="text-lg text-gray-700">{product.description}</p>
                    <div className="text-2xl font-semibold text-blue-700">${product.price}</div>
                    <div className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {product.stock > 0 ? '✅ In Stock' : '❌ Out of Stock'}
                    </div>

                    {product.sizes.length > 0 && (
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-800">Choose your size:</label>
                            <div className="flex gap-3 flex-wrap">
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 py-2 rounded-full border transition-all text-sm ${
                                            selectedSize === size
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400'
                                        }`}
                                        aria-pressed={selectedSize === size}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 mt-6">
                        <button
                            disabled={product.stock === 0}
                            onClick={handleAddToCart}
                            className={`w-full px-6 py-3 rounded-lg font-bold text-white transition duration-200 ${
                                product.stock === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            🛒 Add to Cart
                        </button>

                        <button
                            onClick={handleAddToWishlist}
                            className="w-full px-6 py-3 rounded-lg font-bold text-pink-600 border border-pink-400 hover:bg-pink-50 transition"
                        >
                            ❤️ Add to Wishlist
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-10 border-t pt-10 space-y-10">
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">📝 Reviews</h2>

                {reviews.length === 0 ? (
                    <p className="text-gray-500 italic text-center">No reviews yet. Be the first to review this
                        product!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white shadow-md rounded-lg p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">{review.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        By {userNames[review.userId] || review.userId} • {new Date(review.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-yellow-500 text-lg">{'⭐'.repeat(review.rating)}</div>
                            </div>

                            <p className="text-gray-700 leading-relaxed">{review.content}</p>

                            {comments[review.id]?.length > 0 && (
                                <div className="mt-4 border-l-4 border-blue-200 pl-4 bg-blue-50 rounded-md">
                                    <h4 className="font-semibold text-blue-800 mb-2">💬 Comments</h4>
                                    {comments[review.id].map((comment) => (
                                        <div key={comment.id} className="mb-3">
                                            <p className="text-sm text-gray-700">{comment.content}</p>
                                            <p className="text-xs text-gray-500">
                                                — {userNames[comment.userId] || comment.userId}, {new Date(comment.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const comment = (form.elements.namedItem('comment') as HTMLInputElement).value;
                                    const userId = localStorage.getItem('userId');

                                    const res = await fetch('http://localhost:8086/comments', {
                                        method: 'POST',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify({
                                            reviewId: review.id,
                                            userId,
                                            content: comment
                                        })
                                    });

                                    if (res.ok) {
                                        alert('💬 Comment added!');
                                        window.location.reload();
                                    } else {
                                        alert('❌ Failed to comment.');
                                    }
                                }}
                                className="flex gap-2 mt-4"
                            >
                                <input
                                    name="comment"
                                    required
                                    placeholder="Add a comment..."
                                    className="flex-1 border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Comment
                                </button>
                            </form>
                        </div>
                    ))
                )}

                <div className="mt-12">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">🖊️ Write a Review</h3>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const userId = localStorage.getItem('userId');
                            const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                            const content = (form.elements.namedItem('content') as HTMLInputElement).value;
                            const rating = reviewRating;

                            const res = await fetch('http://localhost:8086/reviews', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({
                                    productId: Number(id),
                                    userId,
                                    title,
                                    content,
                                    rating
                                })
                            });

                            if (res.ok) {
                                alert('✅ Review submitted!');
                                window.location.reload();
                            } else {
                                alert('❌ Failed to submit review.');
                            }
                        }}
                        className="bg-gray-50 p-6 rounded-lg shadow-inner space-y-4"
                    >
                        <input
                            name="title"
                            required
                            placeholder="Review title"
                            className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                            name="content"
                            required
                            placeholder="Your thoughts..."
                            rows={4}
                            className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Your Rating:</label>
                            <StarRating rating={reviewRating} setRating={setReviewRating}/>
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full"
                        >
                            Submit Review
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
