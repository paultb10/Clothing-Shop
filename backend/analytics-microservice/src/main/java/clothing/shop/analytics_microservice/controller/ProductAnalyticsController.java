package clothing.shop.analytics_microservice.controller;

import clothing.shop.analytics_microservice.dto.ProductAnalyticsDTO;
import clothing.shop.analytics_microservice.service.ProductAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics/products")
public class ProductAnalyticsController {

    @Autowired
    private ProductAnalyticsService productAnalyticsService;

    @GetMapping
    public ResponseEntity<ProductAnalyticsDTO> getProductAnalytics() {
        return ResponseEntity.ok(productAnalyticsService.fetchProductAnalytics());
    }
}
