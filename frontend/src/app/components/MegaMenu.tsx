'use client';

import { useEffect, useState, useRef } from 'react';

type Category = {
    id: number;
    name: string;
    parentId: number | null;
    children: Category[];
};
type MegaMenuProps = {
    categories: Category[];
    categoryId: number | null;
    setCategoryId: (id: number | null) => void;
};

export function MegaMenu({ categories, categoryId, setCategoryId }: MegaMenuProps) {
    const [expandedSubs, setExpandedSubs] = useState<{ [key: number]: boolean }>({});
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (catId: number) => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        setExpandedSubs({ [catId]: true });
    };

    const handleMouseLeave = (catId: number) => {
        hoverTimeout.current = setTimeout(() => {
            setExpandedSubs({ [catId]: false });
        }, 200);
    };

    return (
        <ul className="flex space-x-6 items-center text-sm uppercase font-semibold">
            <li>
                <button
                    onClick={() => setCategoryId(null)}
                    className={`px-2 py-1 transition duration-200 ${
                        categoryId === null ? 'text-yellow-400' : 'hover:text-yellow-400'
                    }`}
                >
                    All
                </button>
            </li>

            {categories.map((topCat) => (
                <li
                    key={topCat.id}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(topCat.id)}
                    onMouseLeave={() => handleMouseLeave(topCat.id)}
                >
                    <button
                        onClick={() => setCategoryId(topCat.id)}
                        className={`px-2 py-1 transition duration-200 ${
                            categoryId === topCat.id ? 'text-yellow-400' : 'hover:text-yellow-400'
                        }`}
                    >
                        {topCat.name}
                    </button>

                    {expandedSubs[topCat.id] && topCat.children.length > 0 && (
                        <div
                            className="absolute left-0 top-full mt-2 bg-white text-black shadow-xl z-50 w-[800px] p-6 rounded-md"
                            onMouseEnter={() => handleMouseEnter(topCat.id)}
                            onMouseLeave={() => handleMouseLeave(topCat.id)}
                        >
                            <div className="grid grid-cols-3 gap-6">
                                {topCat.children.map((sub) => (
                                    <div key={sub.id}>
                                        <h4
                                            className="text-md font-bold mb-2 hover:underline cursor-pointer"
                                            onClick={() => setCategoryId(sub.id)}
                                        >
                                            {sub.name}
                                        </h4>
                                        <ul className="space-y-1 text-sm">
                                            {sub.children.map((subsub) => (
                                                <li key={subsub.id}>
                                                    <button
                                                        onClick={() => setCategoryId(subsub.id)}
                                                        className="hover:underline w-full text-left"
                                                    >
                                                        {subsub.name}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}
