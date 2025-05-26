package clothing.shop.email_promo_microservice.repository;


import clothing.shop.email_promo_microservice.model.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromoCodeRepository extends JpaRepository<PromoCode, String> {
}

