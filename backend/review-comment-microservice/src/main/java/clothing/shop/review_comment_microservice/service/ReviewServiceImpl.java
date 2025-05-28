package clothing.shop.review_comment_microservice.service;

import clothing.shop.review_comment_microservice.client.ProductClient;
import clothing.shop.review_comment_microservice.dto.ReviewDTO;
import clothing.shop.review_comment_microservice.model.Review;
import clothing.shop.review_comment_microservice.repository.ReviewRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepo;
    private final ProductClient productClient;

    @Override
    public ReviewDTO create(ReviewDTO dto) {
        try {
            productClient.getProductById(dto.productId());
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("Product not found");
        }

        Review review = new Review();
        review.setProductId(dto.productId());
        review.setUserId(dto.userId());
        review.setTitle(dto.title());
        review.setContent(dto.content());
        review.setRating(dto.rating());
        review.setCreatedAt(LocalDateTime.now());

        review = reviewRepo.save(review);
        return mapToDTO(review);
    }

    @Override
    public List<ReviewDTO> getByProductId(Long productId) {
        return reviewRepo.findByProductId(productId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public ReviewDTO getById(Long id) {
        return reviewRepo.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    @Override
    public void delete(Long id) {
        reviewRepo.deleteById(id);
    }

    private ReviewDTO mapToDTO(Review review) {
        return new ReviewDTO(
                review.getId(),
                review.getProductId(),
                review.getUserId(),
                review.getTitle(),
                review.getContent(),
                review.getRating(),
                review.getCreatedAt()
        );
    }
}

