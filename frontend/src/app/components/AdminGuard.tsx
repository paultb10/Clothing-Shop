'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'ADMIN') {
            router.replace('/unauthorized');
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) {
        return <div className="p-6 text-center text-gray-600">Checking admin access...</div>;
    }

    return <>{children}</>;
}
