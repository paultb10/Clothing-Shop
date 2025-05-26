package clothing.shop.cart_microservice.service;

import clothing.shop.cart_microservice.model.Cart;

public interface CartService {
    Cart getOrCreateCart(String userId);
    Cart removeItem(String userId, Long productId);
    void clearCart(String userId);
    Cart addItem(String userId, Long productId, int quantity, String size);
    Cart updateItemQuantity(String userId, Long productId, String size, int quantity);
}


