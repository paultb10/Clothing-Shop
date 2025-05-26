package clothing.shop.order_microservice.repository;


import clothing.shop.order_microservice.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}

