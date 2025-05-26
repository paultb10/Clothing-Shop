package clothing.shop.analytics_microservice.service;

import clothing.shop.analytics_microservice.dto.ProductAnalyticsDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ProductAnalyticsService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${product.service.url}")
    private String productServiceUrl;

    public ProductAnalyticsDTO fetchProductAnalytics() {
        long totalProducts = countFromEndpoint("/products");
        long totalCategories = countFromEndpoint("/categories");
        long totalBrands = countFromEndpoint("/api/brands"); // note the `/api` prefix for brands
        long totalTags = countFromEndpoint("/tags");

        return new ProductAnalyticsDTO(totalProducts, totalCategories, totalBrands, totalTags);
    }

    private long countFromEndpoint(String path) {
        try {
            ResponseEntity<Map[]> response = restTemplate.getForEntity(productServiceUrl + path, Map[].class);
            return response.getBody() != null ? response.getBody().length : 0;
        } catch (Exception ex) {
            ex.printStackTrace();
            return 0;
        }
    }
}
