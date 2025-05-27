package clothing_shop.user_microservice.controller;

import clothing_shop.user_microservice.dto.*;
import clothing_shop.user_microservice.model.User;
import clothing_shop.user_microservice.security.utils.JwtUtils;
import clothing_shop.user_microservice.service.AuthService;
import clothing_shop.user_microservice.service.TokenBlacklistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        User user = authService.register(request);
        return ResponseEntity.ok(toUserResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = authService.login(request.getEmail(), request.getPassword());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = jwtUtils.generateToken(user.getId(), user.getEmail(), user.getRole().toString());

            return ResponseEntity.ok().body(new LoginResponse(
                    token,
                    user.getId().toString(),
                    user.getRole().toString(),
                    user.getEmail()
            ));
        } else {
            return ResponseEntity.status(401)
                    .body(new ErrorResponse("Invalid email or password"));
        }
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId().toString(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getAddress(),
                user.getRole()
        );
    }

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenBlacklistService.blacklistToken(token);
            return ResponseEntity.ok().body("Logged out successfully");
        } else {
            return ResponseEntity.badRequest().body("Missing or invalid Authorization header");
        }
    }

}
