package clothing.shop.email_promo_microservice.service;

import clothing.shop.email_promo_microservice.model.DiscountType;
import clothing.shop.email_promo_microservice.model.NewsletterSubscriber;
import clothing.shop.email_promo_microservice.model.PromoCode;
import clothing.shop.email_promo_microservice.repository.NewsletterRepository;
import clothing.shop.email_promo_microservice.repository.PromoCodeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.UUID;

@Service
public class PromoService {
    private final PromoCodeRepository promoRepo;
    private final NewsletterRepository newsletterRepo;
    private final EmailService emailService;

    public PromoService(PromoCodeRepository promoRepo, NewsletterRepository newsletterRepo, EmailService emailService) {
        this.promoRepo = promoRepo;
        this.newsletterRepo = newsletterRepo;
        this.emailService = emailService;
    }

    private String generatePromoCode() {
        return "WELCOME-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public PromoCode getPromoCode(String code) {
        return promoRepo.findById(code).orElse(null);
    }

    public void subscribeToNewsletter(String email) {
        if (newsletterRepo.existsById(email)) return;

        String promoCode = generatePromoCode();
        promoRepo.save(PromoCode.builder()
                .code(promoCode)
                .discount(10)
                .type(DiscountType.PERCENTAGE)
                .expiresAt(LocalDateTime.now().plusMonths(1))
                .oneTimeUse(true)
                .usedByUsers(new HashSet<>())
                .build());

        newsletterRepo.save(NewsletterSubscriber.builder()
                .email(email)
                .promoCode(promoCode)
                .build());

        emailService.sendEmail(email, "Welcome to our Newsletter!", "Here is your 10% off promo code: " + promoCode);
    }

    public PromoCode createPromoCode(PromoCode code) {
        return promoRepo.save(code);
    }

    public boolean validatePromoCode(String code, UUID userId) {
        PromoCode promo = promoRepo.findById(code).orElse(null);
        if (promo == null) return false;
        if (promo.getExpiresAt().isBefore(LocalDateTime.now())) return false;
        if (promo.isOneTimeUse() && promo.getUsedByUsers().contains(userId)) return false;

        if (promo.isOneTimeUse()) {
            promo.getUsedByUsers().add(userId);
            promoRepo.save(promo);
        }

        return true;
    }

}
