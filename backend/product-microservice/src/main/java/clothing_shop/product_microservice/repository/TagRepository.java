package clothing_shop.product_microservice.repository;

import clothing_shop.product_microservice.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {}
