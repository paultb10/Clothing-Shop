package clothing.shop.analytics_microservice.controller;

import clothing.shop.analytics_microservice.dto.OrderAnalyticsDTO;
import clothing.shop.analytics_microservice.service.OrderAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics/orders")
public class OrderAnalyticsController {

    @Autowired
    private OrderAnalyticsService orderAnalyticsService;

    @GetMapping
    public ResponseEntity<OrderAnalyticsDTO> getOrderAnalytics() {
        return ResponseEntity.ok(orderAnalyticsService.fetchOrderAnalytics());
    }
}
