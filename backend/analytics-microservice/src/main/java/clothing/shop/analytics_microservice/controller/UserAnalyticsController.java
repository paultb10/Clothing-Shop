package clothing.shop.analytics_microservice.controller;


import clothing.shop.analytics_microservice.dto.UserAnalyticsDTO;
import clothing.shop.analytics_microservice.service.UserAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics/users")
public class UserAnalyticsController {

    @Autowired
    private UserAnalyticsService userAnalyticsService;

    @GetMapping
    public ResponseEntity<UserAnalyticsDTO> getUserAnalytics() {
        return ResponseEntity.ok(userAnalyticsService.fetchUserAnalytics());
    }
}

