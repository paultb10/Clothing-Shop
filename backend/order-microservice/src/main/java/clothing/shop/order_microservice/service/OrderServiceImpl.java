package clothing.shop.order_microservice.service;

import clothing.shop.order_microservice.client.CartClient;
import clothing.shop.order_microservice.client.ProductClient;
import clothing.shop.order_microservice.client.PromoEmailClient;
import clothing.shop.order_microservice.client.UserClient;
import clothing.shop.order_microservice.dto.CartDTO;
import clothing.shop.order_microservice.dto.CartItemDTO;
import clothing.shop.order_microservice.dto.ProductDTO;
import clothing.shop.order_microservice.dto.UserDTO;
import clothing.shop.order_microservice.dto.OrderEmailDTO;
import clothing.shop.order_microservice.model.Order;
import clothing.shop.order_microservice.model.OrderItem;
import clothing.shop.order_microservice.model.OrderStatus;
import clothing.shop.order_microservice.repository.OrderRepository;
import clothing.shop.order_microservice.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartClient cartClient;
    private final UserClient userClient;
    private final ProductClient productClient;
    private final PromoEmailClient promoEmailClient;

    // Inject geocodingService
    private final GeocodingService geocodingService;

    @Override
    public Order placeOrder(UUID userId, String promoCode) {
        UserDTO user = userClient.getUser(userId, "Bearer " + SecurityUtils.getCurrentToken());
        CartDTO cart = cartClient.getCart(userId.toString());
        double[] coords = geocodingService.geocodeAddress(user.getAddress());


        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cart is empty.");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CartItemDTO item : cart.getItems()) {
            ProductDTO product = productClient.getProduct(item.getProductId());

            if (product.getStock() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product ID: " + product.getId());
            }

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .quantity(item.getQuantity())
                    .price(product.getPrice())
                    .size(item.getSize())
                    .build();

            orderItems.add(orderItem);
        }

        // Apply discount if promo code is valid
        if (promoCode != null && !promoCode.isBlank()) {
            try {
                // Call the promo service to validate and get discount
                var response = promoEmailClient.validatePromoByEmail(Map.of(
                        "email", user.getEmail(),
                        "code", promoCode
                ));

                if (response.get("discount") != null && response.get("type") != null) {
                    BigDecimal discount = new BigDecimal(response.get("discount").toString());
                    String type = response.get("type").toString();

                    if ("PERCENTAGE".equalsIgnoreCase(type)) {
                        BigDecimal discountAmount = total.multiply(discount).divide(BigDecimal.valueOf(100));
                        total = total.subtract(discountAmount);
                    } else if ("FIXED".equalsIgnoreCase(type)) {
                        total = total.subtract(discount);
                    }
                }

            } catch (Exception ex) {
                System.err.println("Promo code validation failed: " + ex.getMessage());
                // Optionally allow order to proceed without discount
            }
        }

        System.out.println("Final total after applying promo: " + total);

        Order order = Order.builder()
                .userId(userId)
                .shippingAddress(user.getAddress())
                .destinationLat(coords[0])
                .destinationLng(coords[1])
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .totalAmount(total)
                .items(orderItems)
                .build();

        orderItems.forEach(item -> item.setOrder(order));
        Order savedOrder = orderRepository.save(order);

        return savedOrder;

    }

    @Override
    public List<Order> getOrders(UUID userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus, UUID requesterId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        UserDTO requester = userClient.getUser(requesterId, "Bearer " + SecurityUtils.getCurrentToken());

        boolean isAdmin = requester.getRole().equalsIgnoreCase("ADMIN");
        boolean isUser = requester.getRole().equalsIgnoreCase("USER");

        if (isAdmin) {
            // Admin can set any status
            order.setStatus(newStatus);
        } else if (isUser) {
            if (!order.getUserId().equals(requesterId)) {
                throw new RuntimeException("Users can only cancel their own orders.");
            }
            if (newStatus != OrderStatus.CANCELLED) {
                throw new RuntimeException("Users can only cancel orders.");
            }
            if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
                throw new RuntimeException("Cannot cancel an order that is already shipped or delivered.");
            }

            order.setStatus(OrderStatus.CANCELLED);
        } else {
            throw new RuntimeException("Unauthorized role.");
        }

        return orderRepository.save(order);
    }

    @Override
    public Order cancelOwnOrder(Long orderId, UUID userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserId().equals(userId)) {
            throw new SecurityException("You can only cancel your own orders.");
        }

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("You cannot cancel an order that has been shipped or delivered.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    @Override
    public List<Order> getAllOrders(UUID adminId) {
        UserDTO requester = userClient.getUser(adminId, "Bearer " + SecurityUtils.getCurrentToken());
        if (!requester.getRole().equalsIgnoreCase("ADMIN")) {
            throw new RuntimeException("Unauthorized");
        }
        return orderRepository.findAll();
    }

    @Override
    public Order updateOrderLocation(Long orderId, Double lat, Double lng) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setCurrentLat(lat);
        order.setCurrentLng(lng);

        return orderRepository.save(order);
    }


}

