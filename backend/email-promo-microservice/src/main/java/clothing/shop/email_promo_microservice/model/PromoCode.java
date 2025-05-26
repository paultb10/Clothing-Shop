package clothing.shop.email_promo_microservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromoCode {
    @Id
    private String code;

    private int discount;

    @Enumerated(EnumType.STRING)
    private DiscountType type;

    private LocalDateTime expiresAt;
    private boolean oneTimeUse;

    @ElementCollection
    private Set<UUID> usedByUsers;
}
