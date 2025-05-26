package clothing.shop.cart_microservice.controller;

import clothing.shop.cart_microservice.model.Cart;
import clothing.shop.cart_microservice.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable String userId) {
        return ResponseEntity.ok(cartService.getOrCreateCart(userId));
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<Cart> addItem(
            @PathVariable String userId,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") int quantity,
            @RequestParam String size
    ) {
        return ResponseEntity.ok(cartService.addItem(userId, productId, quantity, size));
    }


    @DeleteMapping("/{userId}/remove")
    public ResponseEntity<Cart> removeItem(
            @PathVariable String userId,
            @RequestParam Long productId
    ) {
        return ResponseEntity.ok(cartService.removeItem(userId, productId));
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{userId}/update")
    public ResponseEntity<Cart> updateQuantity(
            @PathVariable String userId,
            @RequestParam Long productId,
            @RequestParam int quantity,
            @RequestParam String size
    ) {
        return ResponseEntity.ok(cartService.updateItemQuantity(userId, productId, size, quantity));
    }

}
