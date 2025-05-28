package clothing.shop.order_microservice.websocket.controller;

import clothing.shop.order_microservice.model.LocationUpdate;
import clothing.shop.order_microservice.model.OrderStatus;
import clothing.shop.order_microservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class LocationWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final OrderRepository orderRepository;

    @PostMapping("/api/orders/{orderId}/location")
    public ResponseEntity<?> updateLocation(@PathVariable Long orderId, @RequestBody LocationUpdate update) {
        update.setOrderId(orderId);
        System.out.println("📡 Sending WebSocket update for order: " + orderId + " | lat: " + update.getLatitude() + ", lng: " + update.getLongitude());
        messagingTemplate.convertAndSend("/topic/order/" + orderId, update);

        orderRepository.findById(orderId).ifPresent(order -> {
            double destLat = order.getDestinationLat();
            double destLng = order.getDestinationLng();
            double distance = calculateDistance(update.getLatitude(), update.getLongitude(), destLat, destLng);

            if (order.getStatus() == OrderStatus.SHIPPED && distance < 0.1) {
                order.setStatus(OrderStatus.DELIVERED);
                orderRepository.save(order);
                messagingTemplate.convertAndSend("/topic/order-status/" + orderId, "DELIVERED");
            } else if (order.getStatus() == OrderStatus.SHIPPED) {
                messagingTemplate.convertAndSend("/topic/order-status/" + orderId, "SHIPPED");
            }
        });

        return ResponseEntity.ok().build();
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}