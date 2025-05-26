package clothing.shop.wishlist_microservice.repository;

import clothing.shop.wishlist_microservice.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Optional<Wishlist> findByUserId(String userId);
}
