package clothing.shop.analytics_microservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@AllArgsConstructor
public class OrderAnalyticsDTO {
    private long totalOrders;
    private BigDecimal totalRevenue;
    private Map<String, Long> ordersByStatus;
}

