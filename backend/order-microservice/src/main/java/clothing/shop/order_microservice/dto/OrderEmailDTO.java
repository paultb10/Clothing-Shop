package clothing.shop.order_microservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEmailDTO {
    private UUID userId;
    private String shippingAddress;
    private BigDecimal totalAmount;
    private List<String> itemsSummary;
}

