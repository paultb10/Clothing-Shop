'use client';

export default function SkeletonCard() {
    return (
        <div className="bg-gray-200 animate-pulse rounded-xl overflow-hidden shadow-sm">
            <div className="h-48 bg-gray-300" />
            <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                <div className="flex justify-between items-center mt-4">
                    <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
                    <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
                </div>
                <div className="flex gap-1 mt-2">
                    <div className="h-4 w-6 bg-gray-300 rounded-full"></div>
                    <div className="h-4 w-6 bg-gray-300 rounded-full"></div>
                    <div className="h-4 w-6 bg-gray-300 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
