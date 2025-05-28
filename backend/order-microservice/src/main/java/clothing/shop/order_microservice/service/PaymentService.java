package clothing.shop.order_microservice.service;

import clothing.shop.order_microservice.client.UserClient;
import clothing.shop.order_microservice.dto.UserDTO;
import clothing.shop.order_microservice.security.SecurityUtils;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import clothing.shop.order_microservice.model.Order;
import clothing.shop.order_microservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

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

        UUID userId = order.getUserId();

        UserDTO user = userClient.getUser(userId, "Bearer " + SecurityUtils.getCurrentToken());

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
                .putMetadata("order_id", order.getId().toString())
                .build();


        try {
            Session session = Session.create(params);
            order.setStripeSessionId(session.getId());
            orderRepository.save(order);
            return session.getUrl();
        } catch (Exception e) {
            throw new RuntimeException("Stripe session creation failed", e);
        }
    }
}
