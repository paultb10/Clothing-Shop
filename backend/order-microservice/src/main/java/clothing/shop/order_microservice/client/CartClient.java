package clothing.shop.order_microservice.client;

import clothing.shop.order_microservice.dto.CartDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "cart-service", url = "http://localhost:8082")
public interface CartClient {
    @GetMapping("/cart/{userId}")
    CartDTO getCart(@PathVariable String userId);

    @DeleteMapping("/cart/{userId}/clear")
    void clearCart(@PathVariable String userId);

}

