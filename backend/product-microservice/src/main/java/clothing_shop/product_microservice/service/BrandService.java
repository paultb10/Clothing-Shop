package clothing_shop.product_microservice.service;

import clothing_shop.product_microservice.model.Brand;
import clothing_shop.product_microservice.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Optional<Brand> getBrandById(Long id) {
        return brandRepository.findById(id);
    }

    public Brand createBrand(Brand brand) {
        return brandRepository.save(brand);
    }

    public void deleteBrand(Long id) {
        brandRepository.deleteById(id);
    }
}
