package clothing.shop.analytics_microservice.service;

import clothing.shop.analytics_microservice.dto.UserAnalyticsDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.Map;

@Service
public class UserAnalyticsService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${user.service.url}")
    private String userServiceUrl;

    public UserAnalyticsDTO fetchUserAnalytics() {
        String url = userServiceUrl + "/api/users";

        HttpHeaders headers = new HttpHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            System.out.println("Calling URL: " + url);
            ResponseEntity<Map[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map[].class);
            System.out.println("Response Status: " + response.getStatusCode());
            System.out.println("Response Body: " + Arrays.toString(response.getBody()));

            Map[] users = response.getBody();
            if (users == null) {
                return new UserAnalyticsDTO(0, 0, 0);
            }

            long total = users.length;
            long admins = Arrays.stream(users)
                    .filter(u -> "ADMIN".equalsIgnoreCase((String) u.get("role")))
                    .count();
            long regular = total - admins;

            return new UserAnalyticsDTO(total, admins, regular);
        } catch (Exception ex) {
            ex.printStackTrace();
            return new UserAnalyticsDTO(0, 0, 0);
        }
    }

}

