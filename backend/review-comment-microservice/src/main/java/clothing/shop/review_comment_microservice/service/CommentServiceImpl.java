package clothing.shop.review_comment_microservice.service;

import clothing.shop.review_comment_microservice.dto.CommentDTO;
import clothing.shop.review_comment_microservice.model.Comment;
import clothing.shop.review_comment_microservice.repository.CommentRepository;
import clothing.shop.review_comment_microservice.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepo;
    private final ReviewRepository reviewRepo;

    @Override
    public CommentDTO create(CommentDTO dto) {
        // Optional: validate the review exists
        if (!reviewRepo.existsById(dto.reviewId())) {
            throw new RuntimeException("Review not found");
        }

        Comment comment = new Comment();
        comment.setReviewId(dto.reviewId());
        comment.setUserId(dto.userId());
        comment.setContent(dto.content());
        comment.setCreatedAt(LocalDateTime.now());

        comment = commentRepo.save(comment);
        return mapToDTO(comment);
    }

    @Override
    public List<CommentDTO> getByReviewId(Long reviewId) {
        return commentRepo.findByReviewId(reviewId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public void delete(Long id) {
        commentRepo.deleteById(id);
    }

    private CommentDTO mapToDTO(Comment comment) {
        return new CommentDTO(
                comment.getId(),
                comment.getReviewId(),
                comment.getUserId(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}

