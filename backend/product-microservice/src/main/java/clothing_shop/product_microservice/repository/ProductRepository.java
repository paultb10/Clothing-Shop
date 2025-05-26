package clothing_shop.product_microservice.repository;

import clothing_shop.product_microservice.model.Product;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
        SELECT p FROM Product p
        WHERE (:categoryIds IS NULL OR p.category.id IN :categoryIds)
        AND (:tagIds IS NULL OR EXISTS (
            SELECT t FROM p.tags t WHERE t.id IN :tagIds
        ))
    """)
    List<Product> filterWithoutName(@Param("categoryIds") List<Long> categoryIds,
                                    @Param("tagIds") List<Long> tagIds,
                                    Sort sort);

    @Query("""
        SELECT p FROM Product p
        WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))
        AND (:categoryIds IS NULL OR p.category.id IN :categoryIds)
        AND (:tagIds IS NULL OR EXISTS (
            SELECT t FROM p.tags t WHERE t.id IN :tagIds
        ))
    """)
    List<Product> filterWithName(@Param("name") String name,
                                 @Param("categoryIds") List<Long> categoryIds,
                                 @Param("tagIds") List<Long> tagIds,
                                 Sort sort);

    List<Product> findByCategory_Id(Long categoryId);
    List<Product> findByTags_Id(Long tagId);
    List<Product> findByPriceBetween(BigDecimal min, BigDecimal max);
    List<Product> findByNameContainingIgnoreCase(String name);
}
