package clothing_shop.user_microservice.security.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Component
public class JwtUtils {

    private Key jwtKey;
    private final long jwtExpirationMs = 86400000;

    @PostConstruct
    public void init() {
        this.jwtKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
    }

    public String generateToken(UUID userId, String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId.toString())
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(jwtKey)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .setSigningKey(jwtKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

}
