package clothing.shop.cart_microservice.repository;

import clothing.shop.cart_microservice.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {}
