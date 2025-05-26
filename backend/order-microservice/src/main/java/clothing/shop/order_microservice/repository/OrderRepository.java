package clothing.shop.order_microservice.repository;

import clothing.shop.order_microservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;


public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(UUID userId);
    Optional<Order> findByStripeSessionId(String stripeSessionId);
}
