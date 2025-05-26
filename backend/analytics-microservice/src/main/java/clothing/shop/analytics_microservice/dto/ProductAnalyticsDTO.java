package clothing.shop.analytics_microservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductAnalyticsDTO {
    private long totalProducts;
    private long totalCategories;
    private long totalBrands;
    private long totalTags;
}
