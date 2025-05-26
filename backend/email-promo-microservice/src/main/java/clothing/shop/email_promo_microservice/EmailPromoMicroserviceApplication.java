package clothing.shop.email_promo_microservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class EmailPromoMicroserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(EmailPromoMicroserviceApplication.class, args);
	}

}
