package clothing.shop.analytics_microservice.service;


import clothing.shop.analytics_microservice.dto.OrderAnalyticsDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

@Service
public class OrderAnalyticsService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${order.service.url}")
    private String orderServiceUrl;

    public OrderAnalyticsDTO fetchOrderAnalytics() {
        String url = orderServiceUrl + "/api/orders/admin/orders";
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", "3273c1b2-b42e-4449-a6f1-a81b53facf08");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map[].class);
        Map[] orders = response.getBody();

        if (orders == null) return new OrderAnalyticsDTO(0, BigDecimal.ZERO, Map.of());

        long totalOrders = orders.length;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        Map<String, Long> statusCounts = new HashMap<>();

        for (Map order : orders) {
            BigDecimal totalAmount = new BigDecimal(order.get("totalAmount").toString());
            String status = order.get("status").toString();

            totalRevenue = totalRevenue.add(totalAmount);
            statusCounts.put(status, statusCounts.getOrDefault(status, 0L) + 1);
        }

        return new OrderAnalyticsDTO(totalOrders, totalRevenue, statusCounts);
    }
}

