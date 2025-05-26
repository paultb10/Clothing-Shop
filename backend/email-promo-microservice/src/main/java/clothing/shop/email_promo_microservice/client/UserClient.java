package clothing.shop.email_promo_microservice.client;

import clothing.shop.email_promo_microservice.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "user-service", url = "http://localhost:8080/api/users")
public interface UserClient {
    @GetMapping("/{id}")
    UserDTO getUserById(@PathVariable UUID id);
    @GetMapping("/by-email")
    UserDTO getUserByEmail(@RequestParam("email") String email);
}

