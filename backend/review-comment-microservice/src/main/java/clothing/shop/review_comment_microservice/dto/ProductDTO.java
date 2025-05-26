package clothing.shop.review_comment_microservice.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public record ProductDTO(
        Long id,
        String name,
        String description,
        BigDecimal price,
        int stock,
        List<String> imageUrls,
        List<String> sizes,
        Long categoryId,
        Set<Long> tagIds
) {}

