package clothing.shop.order_microservice.controller;

import clothing.shop.order_microservice.dto.StatusUpdateRequest;
import clothing.shop.order_microservice.model.Order;
import clothing.shop.order_microservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/{userId}")
    public ResponseEntity<Order> placeOrder(
            @PathVariable UUID userId,
            @RequestParam(required = false) String promoCode
    ) {
        return ResponseEntity.ok(orderService.placeOrder(userId, promoCode));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Order>> getOrders(@PathVariable UUID userId) {
        return ResponseEntity.ok(orderService.getOrders(userId));
    }

    @GetMapping("/details/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Order> updateStatus(
            @PathVariable Long orderId,
            @RequestBody StatusUpdateRequest request,
            @RequestHeader("X-User-Id") UUID requesterId
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request.getStatus(), requesterId));
    }

    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable Long orderId,
            @RequestHeader("X-User-Id") UUID userId) {

        return ResponseEntity.ok(orderService.cancelOwnOrder(orderId, userId));
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<List<Order>> getAllOrdersForAdmin(@RequestHeader("X-User-Id") UUID adminId) {
        return ResponseEntity.ok(orderService.getAllOrders(adminId));
    }

    @PatchMapping("/{orderId}/location")
    public ResponseEntity<Order> updateOrderLocation(
            @PathVariable Long orderId,
            @RequestBody Map<String, Double> location
    ) {
        Double lat = location.get("latitude");
        Double lng = location.get("longitude");

        Order updatedOrder = orderService.updateOrderLocation(orderId, lat, lng);
        return ResponseEntity.ok(updatedOrder);
    }

}
