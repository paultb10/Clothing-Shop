package clothing.shop.email_promo_microservice.repository;

import clothing.shop.email_promo_microservice.model.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsletterRepository extends JpaRepository<NewsletterSubscriber, String> {
}
