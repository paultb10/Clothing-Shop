package clothing.shop.order_microservice.service;

import clothing.shop.order_microservice.model.Order;

import java.util.List;
import java.util.UUID;
import clothing.shop.order_microservice.model.OrderStatus;


public interface OrderService {
    List<Order> getOrders(UUID userId);
    Order getOrderById(Long orderId);
    Order updateOrderStatus(Long orderId, OrderStatus newStatus, UUID requesterId);
    Order cancelOwnOrder(Long orderId, UUID userId);
    List<Order> getAllOrders(UUID adminId);
    Order placeOrder(UUID userId, String promoCode);
}

