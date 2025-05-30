package clothing.shop.review_comment_microservice.repository;

import clothing.shop.review_comment_microservice.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByReviewId(Long reviewId);
}
