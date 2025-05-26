package clothing.shop.review_comment_microservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReviewDTO(
        Long id,
        Long productId,
        UUID userId,
        String title,
        String content,
        int rating,
        LocalDateTime createdAt
) {}
