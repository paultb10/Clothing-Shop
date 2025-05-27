package clothing.shop.order_microservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;

@Service
public class GeocodingService {

    @Value("${google.api.key}")
    private String googleApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public double[] geocodeAddress(String address) {
        URI uri = UriComponentsBuilder.fromUriString("https://maps.googleapis.com/maps/api/geocode/json")
                .queryParam("address", address)
                .queryParam("key", googleApiKey)
                .build()
                .toUri();

        var response = restTemplate.getForObject(uri, Map.class);
        var results = (List<Map<String, Object>>) response.get("results");

        if (results == null || results.isEmpty()) {
            throw new RuntimeException("Geocoding failed: no results");
        }

        var location = (Map<String, Object>) ((Map<String, Object>) results.get(0).get("geometry")).get("location");
        double lat = (Double) location.get("lat");
        double lng = (Double) location.get("lng");

        return new double[]{lat, lng};
    }
}

