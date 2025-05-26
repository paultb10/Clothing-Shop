package clothing.shop.analytics_microservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserAnalyticsDTO {
    private long totalUsers;
    private long totalAdmins;
    private long totalRegularUsers;
}
