package clothing_shop.user_microservice.dto;

import clothing_shop.user_microservice.model.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String address;
    private Role role;
}
