package clothing.shop.email_promo_microservice.controller;

import clothing.shop.email_promo_microservice.client.UserClient;
import clothing.shop.email_promo_microservice.dto.UserDTO;
import clothing.shop.email_promo_microservice.model.PromoCode;
import clothing.shop.email_promo_microservice.service.EmailService;
import clothing.shop.email_promo_microservice.service.PromoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PromoController {

    private final PromoService promoService;
    private final UserClient userClient;
    private final EmailService emailService;

    @PostMapping("/newsletter/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, String> request) {
        promoService.subscribeToNewsletter(request.get("email"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/promos")
    public ResponseEntity<PromoCode> createPromo(@RequestBody PromoCode code) {
        return ResponseEntity.ok(promoService.createPromoCode(code));
    }

    @PostMapping("/promos/validate")
    public ResponseEntity<?> validatePromoByEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        if (email == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and promo code are required."));
        }

        UserDTO user = userClient.getUserByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User with given email does not exist."));
        }

        PromoCode promo = promoService.getPromoCode(code);
        if (promo == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Promo code does not exist."));
        }

        boolean valid = promoService.validatePromoCode(code, user.getId());
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("message", "Promo code is invalid, expired, or already used."));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Promo code is valid and can be used.",
                "discount", promo.getDiscount(),
                "type", promo.getType().toString()
        ));
    }


    @PostMapping("/emails/order-confirm")
    public ResponseEntity<?> sendOrderConfirmation(@RequestBody Map<String, Object> orderData) {
        UUID userId = UUID.fromString(orderData.get("userId").toString());
        UserDTO user = userClient.getUserById(userId);

        String total = String.valueOf(orderData.get("totalAmount"));
        String shipping = orderData.get("shippingAddress") != null
                ? orderData.get("shippingAddress").toString()
                : "Not specified";

        String message = String.format(
                "Hello %s, your order has been confirmed!\nTotal: %s\nShipping to: %s",
                user.getFirstName(),
                total,
                shipping
        );

        emailService.sendEmail(user.getEmail(), "Order Confirmation", message);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/test-email")
    public ResponseEntity<String> testEmail(@RequestParam String to) {
        emailService.sendEmail(to, "Test Email", "This is a test email from your Spring Boot app.");
        return ResponseEntity.ok("Email sent to " + to);
    }

}