package clothing_shop.product_microservice.repository;

import clothing_shop.product_microservice.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Long> {
}

