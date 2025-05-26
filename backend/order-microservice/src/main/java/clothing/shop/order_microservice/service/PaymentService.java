package clothing.shop.order_microservice.service;

import clothing.shop.order_microservice.client.UserClient;
import clothing.shop.order_microservice.dto.UserDTO;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import clothing.shop.order_microservice.model.Order;
import clothing.shop.order_microservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final UserClient userClient;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    public String createCheckoutSession(Long orderId, BigDecimal totalAmount) {
        Stripe.apiKey = stripeSecretKey;

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        UserDTO user = userClient.getUser(order.getUserId()); // ✅ fetch user info

        // Optional: Sanity check to ensure order total matches expected totalAmount

        SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount(totalAmount.multiply(BigDecimal.valueOf(100)).longValue()) // in cents
                                .setProductData(
                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                .setName("Order #" + orderId)
                                                .build()
                                )
                                .build()
                )
                .build();

        SessionCreateParams params = SessionCreateParams.builder()
                .setCustomerEmail(user.getEmail())
                .addLineItem(lineItem)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:3000/orders")
                .setCancelUrl("http://localhost:3000/cart")
                .putMetadata("order_id", order.getId().toString())  // ✅ helpful to fallback if needed
                .build();


        try {
            Session session = Session.create(params);
            order.setStripeSessionId(session.getId());
            orderRepository.save(order); // update with session ID
            return session.getUrl(); // return the redirect URL
        } catch (Exception e) {
            throw new RuntimeException("Stripe session creation failed", e);
        }
    }
}
