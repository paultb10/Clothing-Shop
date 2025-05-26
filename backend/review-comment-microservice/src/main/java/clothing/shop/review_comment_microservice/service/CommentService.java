package clothing.shop.review_comment_microservice.service;

import clothing.shop.review_comment_microservice.dto.CommentDTO;

import java.util.List;

public interface CommentService {
    CommentDTO create(CommentDTO dto);
    List<CommentDTO> getByReviewId(Long reviewId);
    void delete(Long id);
}

