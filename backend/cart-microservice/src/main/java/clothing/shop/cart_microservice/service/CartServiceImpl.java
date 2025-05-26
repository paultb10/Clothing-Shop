package clothing.shop.cart_microservice.service;

import clothing.shop.cart_microservice.model.Cart;
import clothing.shop.cart_microservice.model.CartItem;
import clothing.shop.cart_microservice.repository.CartItemRepository;
import clothing.shop.cart_microservice.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepo;
    private final CartItemRepository itemRepo;

    @Override
    public Cart getOrCreateCart(String userId) {
        return cartRepo.findByUserId(userId)
                .orElseGet(() -> cartRepo.save(Cart.builder()
                        .userId(userId)
                        .items(new ArrayList<>())
                        .build()));
    }

    @Override
    public Cart addItem(String userId, Long productId, int quantity, String size) {
        Cart cart = getOrCreateCart(userId);

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId) && item.getSize().equals(size))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .productId(productId)
                    .quantity(quantity)
                    .size(size)
                    .cart(cart)
                    .build();
            cart.getItems().add(newItem);
        }

        return cartRepo.save(cart);
    }


    @Override
    public Cart removeItem(String userId, Long productId) {
        Cart cart = getOrCreateCart(userId);

        cart.getItems().removeIf(item -> item.getProductId().equals(productId));

        return cartRepo.save(cart);
    }

    @Override
    public void clearCart(String userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepo.save(cart);
    }

    @Override
    public Cart updateItemQuantity(String userId, Long productId, String size, int quantity) {
        Cart cart = getOrCreateCart(userId);

        cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId) && item.getSize().equals(size))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));

        return cartRepo.save(cart);
    }

}
