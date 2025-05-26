package clothing.shop.order_microservice.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDTO {
    private Long id;
    private String userId;
    private List<CartItemDTO> items;
}
