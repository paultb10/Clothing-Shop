'use client';

import {
    GoogleMap,
    LoadScript,
    Marker,
    Polyline,
} from '@react-google-maps/api';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

const containerStyle = {
    width: '100%',
    height: '600px',
};

const centralDeposit = { lat: 46.770439, lng: 23.591423 };

export default function OrderTrackingPage() {
    const { id } = useParams();
    const orderId = Number(id);

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mapsApi, setMapsApi] = useState<typeof google.maps | null>(null);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);
    const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [trackingStarted, setTrackingStarted] = useState(false);
    const mapRef = useRef<google.maps.Map | null>(null);

    const destination = useMemo(() => ({
        lat: order?.destinationLat,
        lng: order?.destinationLng,
    }), [order]);

    const initialDriverPos = useMemo(() => ({
        lat: order?.currentLat ?? centralDeposit.lat,
        lng: order?.currentLng ?? centralDeposit.lng,
    }), [order]);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`http://localhost:8084/api/orders/details/${orderId}`);
                const data = await res.json();
                setOrder(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    useEffect(() => {
        if (!order || order.status !== 'SHIPPED') return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:8084/api/orders/details/${orderId}`);
                const data = await res.json();
                setOrder(data);
            } catch (err) {
                console.error(err);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [orderId, order]);

    useEffect(() => {
        if (!order || order.status !== 'SHIPPED') return;

        const interval = setInterval(() => {
            const fetchUpdate = async () => {
                try {
                    const res = await fetch(`http://localhost:8084/api/orders/details/${orderId}`);
                    const data = await res.json();
                    setOrder(data);
                } catch (err) {
                    console.error('Failed to fetch tracking update:', err);
                }
            };

            fetchUpdate();
        }, 10000);

        return () => clearInterval(interval);
    }, [orderId, order]);


    useEffect(() => {
        if (!mapsApi || !order) return;

        const service = new mapsApi.DirectionsService();
        service.route(
            {
                origin: initialDriverPos,
                destination,
                travelMode: mapsApi.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === mapsApi.DirectionsStatus.OK && result && result.routes.length > 0) {
                    setDirections(result);
                    const converted = result.routes[0].overview_path.map((point) => ({
                        lat: point.lat(),
                        lng: point.lng(),
                    }));
                    setRoutePath(converted);
                }
            }
        );
    }, [mapsApi, order]);

    const currentRef = useRef(0);
    const progressRef = useRef(0);

    useEffect(() => {
        if (!trackingStarted || !routePath.length) return;

        const stepSize = 0.00005;
        const interval = setInterval(() => {
            const current = currentRef.current;
            const progress = progressRef.current;

            if (current >= routePath.length - 1) {
                console.log('✅ Reached destination');
                clearInterval(interval);

                fetch(`http://localhost:8084/api/orders/${orderId}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Id': '3273c1b2-b42e-4449-a6f1-a81b53facf08',
                    },
                    body: JSON.stringify({ status: 'DELIVERED' }),
                })
                    .then((res) => {
                        if (!res.ok) throw new Error('Failed to update status');
                        return res.json();
                    })
                    .then((updatedOrder) => {
                        console.log('🚚 Order marked as DELIVERED');
                        setOrder(updatedOrder);
                    })
                    .catch(console.error);

                return;
            }


            const start = routePath[current];
            const end = routePath[current + 1];

            const deltaLat = end.lat - start.lat;
            const deltaLng = end.lng - start.lng;
            const distance = Math.sqrt(deltaLat ** 2 + deltaLng ** 2);

            if (progress < 1) {
                const nextProgress = progress + stepSize / distance;
                progressRef.current = nextProgress;

                const intermediatePoint = {
                    lat: start.lat + deltaLat * nextProgress,
                    lng: start.lng + deltaLng * nextProgress,
                };

                fetch(`http://localhost:8084/api/orders/${orderId}/location`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(intermediatePoint),
                })
                    .then(() => {
                        setLiveLocation(intermediatePoint);
                    })
                    .catch(console.error);
            } else {
                currentRef.current += 1;
                progressRef.current = 0;
            }
        }, 300);

        return () => clearInterval(interval);
    }, [trackingStarted, routePath, orderId]);




    if (loading || !order) return <p className="text-center mt-10">Loading order #{orderId}...</p>;

    if (order.status !== 'SHIPPED') {
        return (
            <div className="text-center mt-10">
                <h2 className="text-2xl">📦 Order #{order.id}</h2>
                <p className="text-gray-500 mt-2">Tracking is only available when status is <strong>SHIPPED</strong>.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto mt-10 px-4">
            <h1 className="text-3xl font-bold mb-6">📦 Tracking Order #{order.id}</h1>

            <div className="bg-white shadow-md rounded-md p-6 mb-6">
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Destination:</strong> {order.shippingAddress}</p>
                <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
            </div>

            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    zoom={13}
                    onLoad={(map) => {
                        mapRef.current = map;
                        map.panTo(initialDriverPos);
                        if (window.google) setMapsApi(window.google.maps);
                    }}
                >
                    <Marker position={centralDeposit} label="📦" />
                    <Marker position={destination} label="🏠" />

                    {liveLocation && (
                        <Marker
                            position={liveLocation}
                            icon={{
                                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">
                    <text y="50%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="28">🚚</text>
                  </svg>
                `)}`,
                                scaledSize: new window.google.maps.Size(48, 48),
                            }}
                        />
                    )}

                    {directions && (
                        <Polyline
                            path={directions.routes[0].overview_path}
                            options={{ strokeColor: '#4285F4', strokeOpacity: 0.9, strokeWeight: 5 }}
                        />
                    )}
                </GoogleMap>
            </LoadScript>

            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">🚚 Simulate Driver</h2>
                <button
                    onClick={() => setTrackingStarted(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    disabled={!routePath.length || trackingStarted}
                >
                    Start Simulation
                </button>
            </div>
        </div>
    );
}
