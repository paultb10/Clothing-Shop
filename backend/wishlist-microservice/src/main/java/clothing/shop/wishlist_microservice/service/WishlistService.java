package clothing.shop.wishlist_microservice.service;

import clothing.shop.wishlist_microservice.model.Wishlist;
import clothing.shop.wishlist_microservice.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository repo;

    public Wishlist getOrCreateWishlist(String userId) {
        return repo.findByUserId(userId)
                .orElseGet(() -> repo.save(Wishlist.builder().userId(userId).productIds(new HashSet<>()).build()));
    }

    public Wishlist addProduct(String userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        wishlist.getProductIds().add(productId);
        return repo.save(wishlist);
    }

    public Wishlist removeProduct(String userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        wishlist.getProductIds().remove(productId);
        return repo.save(wishlist);
    }

    public void clear(String userId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        wishlist.getProductIds().clear();
        repo.save(wishlist);
    }
}
