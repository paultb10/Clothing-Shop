package clothing_shop.product_microservice.service;

import clothing_shop.product_microservice.dto.TagDTO;
import clothing_shop.product_microservice.model.Tag;
import clothing_shop.product_microservice.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

public interface TagService {
    TagDTO create(TagDTO dto);
    TagDTO update(Long id, TagDTO dto);
    List<TagDTO> getAll();
    TagDTO getById(Long id);
    void delete(Long id);
}

@Service
@RequiredArgsConstructor
class TagServiceImpl implements TagService {

    private final TagRepository tagRepo;

    @Override
    public TagDTO create(TagDTO dto) {
        Tag tag = new Tag();
        return saveOrUpdate(tag, dto);
    }

    @Override
    public TagDTO update(Long id, TagDTO dto) {
        Tag tag = tagRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found"));
        return saveOrUpdate(tag, dto);
    }

    private TagDTO saveOrUpdate(Tag tag, TagDTO dto) {
        tag.setName(dto.name());
        tag = tagRepo.save(tag);
        return new TagDTO(tag.getId(), tag.getName());
    }

    @Override
    public List<TagDTO> getAll() {
        return tagRepo.findAll().stream()
                .map(tag -> new TagDTO(tag.getId(), tag.getName()))
                .toList();
    }

    @Override
    public TagDTO getById(Long id) {
        Tag tag = tagRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found"));
        return new TagDTO(tag.getId(), tag.getName());
    }

    @Override
    public void delete(Long id) {
        if (!tagRepo.existsById(id)) {
            throw new RuntimeException("Tag not found");
        }
        tagRepo.deleteById(id);
    }
}
