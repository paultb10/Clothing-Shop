package clothing.shop.order_microservice.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import clothing.shop.order_microservice.client.CartClient;
import clothing.shop.order_microservice.client.PromoEmailClient;
import clothing.shop.order_microservice.dto.OrderEmailDTO;
import clothing.shop.order_microservice.model.Order;
import clothing.shop.order_microservice.model.OrderStatus;
import clothing.shop.order_microservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final OrderRepository orderRepository;
    private final PromoEmailClient promoEmailClient;
    private final CartClient cartClient;

    @Value("${stripe.webhook-secret}")
    private String endpointSecret;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            System.out.println("📦 Received Stripe webhook");
            System.out.println("📨 Event type: " + event.getType());

            if ("checkout.session.completed".equals(event.getType())) {
                EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
                Object deserializedObject = deserializer.getObject().orElse(null);
                String sessionId = null;

                if (deserializedObject instanceof Session session) {
                    sessionId = session.getId();
                    System.out.println("✅ Deserialized session ID: " + sessionId);
                } else {
                    System.err.println("❌ Failed to deserialize Session object. Falling back to raw JSON...");
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode root = mapper.readTree(payload);
                    sessionId = root.path("data").path("object").path("id").asText();
                    System.out.println("🆘 Fallback session ID from raw JSON: " + sessionId);
                }

                if (sessionId != null && !sessionId.isBlank()) {
                    Order order = orderRepository.findByStripeSessionId(sessionId)
                            .orElseThrow(() -> new RuntimeException("Order not found for session: "));

                    order.setStatus(OrderStatus.CONFIRMED);
                    orderRepository.save(order);
                    System.out.println("✅ Order confirmed: " + order.getId());

                    // ✅ Extract item summaries into final variable first
                    final List<String> itemSummaries = order.getItems().stream()
                            .map(i -> String.format("%dx Product #%d (%s)", i.getQuantity(), i.getProductId(), i.getSize()))
                            .toList();

                    // ✅ Send Email
                    OrderEmailDTO dto = new OrderEmailDTO(
                            order.getUserId(),
                            order.getShippingAddress(),
                            order.getTotalAmount(),
                            itemSummaries
                    );

                    try {
                        promoEmailClient.sendOrderConfirmation(dto);
                        System.out.println("📧 Email sent for order: " + order.getId());
                    } catch (Exception e) {
                        System.err.println("❌ Email send failed: " + e.getMessage());
                        e.printStackTrace();
                    }

                    // ✅ Clear Cart
                    try {
                        cartClient.clearCart(order.getUserId().toString());
                        System.out.println("🧹 Cart cleared for user: " + order.getUserId());
                    } catch (Exception e) {
                        System.err.println("❌ Failed to clear cart: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
 else {
                    System.err.println("❌ Could not extract session ID from webhook payload.");
                }
            }

            return ResponseEntity.ok("Webhook handled");

        } catch (Exception e) {
            System.err.println("❌ Stripe webhook handling failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).body("Webhook Error: " + e.getMessage());
        }
    }
}
