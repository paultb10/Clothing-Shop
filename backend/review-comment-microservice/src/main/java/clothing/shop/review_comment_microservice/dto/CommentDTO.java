package clothing.shop.review_comment_microservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CommentDTO(
        Long id,
        Long reviewId,
        UUID userId,
        String content,
        LocalDateTime createdAt
) {}

