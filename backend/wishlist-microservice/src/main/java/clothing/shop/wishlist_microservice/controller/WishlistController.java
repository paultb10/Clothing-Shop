package clothing.shop.wishlist_microservice.controller;

import clothing.shop.wishlist_microservice.model.Wishlist;
import clothing.shop.wishlist_microservice.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService service;

    @GetMapping("/{userId}")
    public ResponseEntity<Wishlist> get(@PathVariable String userId) {
        return ResponseEntity.ok(service.getOrCreateWishlist(userId));
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<Wishlist> add(@PathVariable String userId, @RequestParam Long productId) {
        return ResponseEntity.ok(service.addProduct(userId, productId));
    }

    @DeleteMapping("/{userId}/remove")
    public ResponseEntity<Wishlist> remove(@PathVariable String userId, @RequestParam Long productId) {
        return ResponseEntity.ok(service.removeProduct(userId, productId));
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Void> clear(@PathVariable String userId) {
        service.clear(userId);
        return ResponseEntity.noContent().build();
    }
}
