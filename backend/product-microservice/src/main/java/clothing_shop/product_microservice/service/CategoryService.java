package clothing_shop.product_microservice.service;

import clothing_shop.product_microservice.dto.CategoryDTO;
import clothing_shop.product_microservice.model.Category;
import clothing_shop.product_microservice.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

public interface CategoryService {
    CategoryDTO create(CategoryDTO dto);
    CategoryDTO update(Long id, CategoryDTO dto);
    List<CategoryDTO> getAll();
    CategoryDTO getById(Long id);
    void delete(Long id);
}

@Service
@RequiredArgsConstructor
class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepo;

    @Override
    public CategoryDTO create(CategoryDTO dto) {
        Category category = new Category();
        return saveOrUpdate(category, dto);
    }

    @Override
    public CategoryDTO update(Long id, CategoryDTO dto) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return saveOrUpdate(category, dto);
    }

    private CategoryDTO saveOrUpdate(Category category, CategoryDTO dto) {
        category.setName(dto.name());
        if (dto.parentId() != null) {
            Category parent = categoryRepo.findById(dto.parentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        category = categoryRepo.save(category);
        return new CategoryDTO(
                category.getId(),
                category.getName(),
                category.getParent() != null ? category.getParent().getId() : null
        );
    }

    @Override
    public List<CategoryDTO> getAll() {
        return categoryRepo.findAll().stream()
                .map(c -> new CategoryDTO(
                        c.getId(),
                        c.getName(),
                        c.getParent() != null ? c.getParent().getId() : null))
                .toList();
    }

    @Override
    public CategoryDTO getById(Long id) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return new CategoryDTO(
                category.getId(),
                category.getName(),
                category.getParent() != null ? category.getParent().getId() : null
        );
    }

    @Override
    public void delete(Long id) {
        if (!categoryRepo.existsById(id)) {
            throw new RuntimeException("Category not found");
        }
        categoryRepo.deleteById(id);
    }
}
