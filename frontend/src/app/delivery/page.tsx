'use client';

import { useEffect, useState } from 'react';

export default function DriverSimulator() {
    const [orderId, setOrderId] = useState<number | ''>('');
    const [path, setPath] = useState<google.maps.LatLngLiteral[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const [googleReady, setGoogleReady] = useState(false); // ⬅️ Proper client flag

    const origin = { lat: 46.770439, lng: 23.591423 };
    const destination = { lat: 46.7743731, lng: 23.6120002 };

    useEffect(() => {
        if (typeof window !== 'undefined' && window.google?.maps) {
            setGoogleReady(true);
        }
    }, []);

    const fetchRoute = () => {
        if (!googleReady) return console.warn('Google Maps API not loaded');

        const directionsService = new google.maps.DirectionsService();

        directionsService.route(
            {
                origin,
                destination,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) {
                    const route = result.routes[0].overview_path;
                    const converted = route.map((point) => ({
                        lat: point.lat(),
                        lng: point.lng(),
                    }));
                    setPath(converted);
                } else {
                    console.error('Failed to get directions:', status);
                }
            }
        );
    };

    const sendLocationUpdate = async (lat: number, lng: number) => {
        try {
            await fetch(`http://localhost:8084/api/orders/${orderId}/location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude: lat, longitude: lng }),
            });
            console.log(`📤 Sent location: ${lat}, ${lng}`);
        } catch (err) {
            console.error('❌ Failed to send location:', err);
        }
    };

    const startMockTracking = () => {
        if (!orderId || typeof orderId !== 'number') {
            alert('Enter a valid order ID');
            return;
        }

        if (!path.length) {
            alert('Route not loaded yet!');
            return;
        }

        const id = setInterval(() => {
            if (currentIndex >= path.length) {
                clearInterval(id);
                console.log('✅ Reached destination.');
                return;
            }

            const point = path[currentIndex];
            sendLocationUpdate(point.lat, point.lng);
            setCurrentIndex((prev) => prev + 1);
        }, 2000);

        setIntervalId(id);
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">🚚 Driver Simulator</h1>

            <input
                type="number"
                placeholder="Order ID"
                value={orderId}
                onChange={(e) => setOrderId(Number(e.target.value))}
                className="border p-2 w-full mb-4"
            />

            {/* Always render structure. Disable functionality if google isn't ready */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={googleReady ? fetchRoute : undefined}
                    disabled={!googleReady}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md w-full disabled:opacity-50"
                >
                    Load Route
                </button>

                <button
                    onClick={googleReady ? startMockTracking : undefined}
                    disabled={!googleReady}
                    className="bg-green-600 text-white px-4 py-2 rounded-md w-full disabled:opacity-50"
                >
                    Start Tracking
                </button>
            </div>
        </div>
    );
}
