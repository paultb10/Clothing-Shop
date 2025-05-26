package clothing_shop.product_microservice.dto;

public record CategoryDTO(
        Long id,
        String name,
        Long parentId
) {}
