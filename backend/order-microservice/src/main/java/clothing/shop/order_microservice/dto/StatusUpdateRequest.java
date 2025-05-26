package clothing.shop.order_microservice.dto;

import clothing.shop.order_microservice.model.OrderStatus;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    private OrderStatus status;
}
