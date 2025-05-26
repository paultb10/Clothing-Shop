package clothing.shop.review_comment_microservice.service;

import clothing.shop.review_comment_microservice.dto.ReviewDTO;

import java.util.List;

public interface ReviewService {
    ReviewDTO create(ReviewDTO dto);
    List<ReviewDTO> getByProductId(Long productId);
    ReviewDTO getById(Long id);
    void delete(Long id);
}

