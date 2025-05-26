package clothing.shop.order_microservice.client;

import clothing.shop.order_microservice.dto.OrderEmailDTO;
import clothing.shop.order_microservice.model.Order;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "promo-service", url = "http://localhost:8085") // or Eureka service ID
public interface PromoEmailClient {
    @PostMapping("/api/emails/order-confirm")
    void sendOrderConfirmation(@RequestBody OrderEmailDTO order);

    @PostMapping("/api/promos/validate")
    Map<String, Object> validatePromoByEmail(@RequestBody Map<String, String> payload);

}

