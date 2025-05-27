import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function useOrderTracking(orderId: number) {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        const socket = new SockJS('http://localhost:8084/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe(`/topic/order/${orderId}`, (message) => {
                    const body = JSON.parse(message.body);
                    console.log('✅ WebSocket update:', body);
                    console.log('📡 Received location message:', message.body);

                    // ✅ Transform incoming structure
                    setLocation({
                        lat: body.latitude,
                        lng: body.longitude,
                    });
                });
            },
        });

        client.activate();

        client.onStompError = function (frame) {
            console.error('WebSocket Error:', frame.headers['message']);
            console.error('Details:', frame.body);
        };

        return () => {
            client.deactivate();
        };
    }, [orderId]);

    return location;
}

