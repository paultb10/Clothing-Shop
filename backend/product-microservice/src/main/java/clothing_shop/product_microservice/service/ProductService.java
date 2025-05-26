package clothing_shop.product_microservice.service;

import clothing_shop.product_microservice.dto.ProductDTO;
import clothing_shop.product_microservice.model.Category;
import clothing_shop.product_microservice.model.Product;
import clothing_shop.product_microservice.model.Tag;
import clothing_shop.product_microservice.repository.CategoryRepository;
import clothing_shop.product_microservice.repository.ProductRepository;
import clothing_shop.product_microservice.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public interface ProductService {
    ProductDTO create(ProductDTO dto);
    List<ProductDTO> getAll();
    ProductDTO getById(Long id);
    ProductDTO update(Long id, ProductDTO dto);
    void delete(Long id);
    List<ProductDTO> searchByName(String name);
    List<ProductDTO> filterProducts(String name, Long categoryId, List<Long> tagIds, String sortDirection);
}

@Service
@RequiredArgsConstructor
class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final TagRepository tagRepo;

    @Override
    public ProductDTO create(ProductDTO dto) {
        Product product = new Product();
        return saveOrUpdate(product, dto);
    }

    @Override
    public ProductDTO update(Long id, ProductDTO dto) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return saveOrUpdate(product, dto);
    }

    private ProductDTO saveOrUpdate(Product product, ProductDTO dto) {
        product.setName(dto.name());
        product.setDescription(dto.description());
        product.setPrice(dto.price());
        product.setStock(dto.stock());
        product.setImageUrls(dto.imageUrls());
        product.setSizes(dto.sizes());

        Category category = categoryRepo.findById(dto.categoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCategory(category);

        Set<Tag> tags = tagRepo.findAllById(dto.tagIds()).stream().collect(Collectors.toSet());
        product.setTags(tags);

        product = productRepo.save(product);
        return mapToDTO(product);
    }

    @Override
    public List<ProductDTO> getAll() {
        return productRepo.findAll().stream().map(this::mapToDTO).toList();
    }

    @Override
    public ProductDTO getById(Long id) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToDTO(product);
    }

    @Override
    public void delete(Long id) {
        if (!productRepo.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        productRepo.deleteById(id);
    }

    private ProductDTO mapToDTO(Product p) {
        return new ProductDTO(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getStock(),
                p.getImageUrls(),
                p.getSizes(),
                p.getCategory().getId(),
                p.getTags().stream().map(Tag::getId).collect(Collectors.toSet())
        );
    }

    @Override
    public List<ProductDTO> searchByName(String name) {
        return productRepo.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<ProductDTO> filterProducts(String name, Long categoryId, List<Long> tagIds, String sortDirection) {
        if (tagIds != null && tagIds.isEmpty()) tagIds = null;

        Sort sort = Sort.unsorted();
        if ("asc".equalsIgnoreCase(sortDirection)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("desc".equalsIgnoreCase(sortDirection)) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        }

        List<Long> categoryIds = null;
        if (categoryId != null) {
            categoryIds = getAllSubcategoryIds(categoryId);
        }

        if (name == null) {
            return productRepo.filterWithoutName(categoryIds, tagIds, sort)
                    .stream()
                    .map(this::mapToDTO)
                    .toList();
        } else {
            return productRepo.filterWithName(name, categoryIds, tagIds, sort)
                    .stream()
                    .map(this::mapToDTO)
                    .toList();
        }
    }

    private List<Long> getAllSubcategoryIds(Long categoryId) {
        List<Long> result = new ArrayList<>();
        collectSubcategoryIds(categoryId, result);
        return result;
    }

    private void collectSubcategoryIds(Long parentId, List<Long> result) {
        result.add(parentId);
        List<Category> children = categoryRepo.findByParentId(parentId);
        for (Category child : children) {
            collectSubcategoryIds(child.getId(), result);
        }
    }

}
