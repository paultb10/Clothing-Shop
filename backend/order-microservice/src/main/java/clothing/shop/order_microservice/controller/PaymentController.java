package clothing.shop.order_microservice.controller;

import clothing.shop.order_microservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-checkout-session/{orderId}")
    public ResponseEntity<?> createCheckoutSession(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> payload) {

        BigDecimal amount = new BigDecimal(payload.get("amount").toString());

        String checkoutUrl = paymentService.createCheckoutSession(orderId, amount);
        return ResponseEntity.ok().body(Map.of("url", checkoutUrl));
    }
}
