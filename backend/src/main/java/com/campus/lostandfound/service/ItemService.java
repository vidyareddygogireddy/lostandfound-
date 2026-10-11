package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.ItemRequest;
import com.campus.lostandfound.entity.Item;
import com.campus.lostandfound.entity.User;
import com.campus.lostandfound.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    public List<Item> getAllItems(String itemType, String category, String location, String search, String status) {
        return itemRepository.searchAndFilter(
                (itemType != null && !itemType.isBlank()) ? itemType : null,
                (category != null && !category.isBlank()) ? category : null,
                (location != null && !location.isBlank()) ? location : null,
                (search != null && !search.isBlank()) ? search : null,
                (status != null && !status.isBlank()) ? status : null
        );
    }

    public Item getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
    }

    public List<Item> getItemsByUser(User user) {
        return itemRepository.findByUserOrderByItemIdDesc(user);
    }

    public Item createItem(ItemRequest request, MultipartFile image, User user) {
        String imageUrl = null;

        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        }

        LocalDate dateReported = LocalDate.now();
        if (request.getDateReported() != null && !request.getDateReported().isBlank()) {
            try {
                dateReported = LocalDate.parse(request.getDateReported());
            } catch (Exception ignored) {
            }
        }

        Item item = Item.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .itemType(request.getItemType().toUpperCase())
                .category(request.getCategory().toUpperCase())
                .location(request.getLocation())
                .dateReported(dateReported)
                .imageUrl(imageUrl)
                .status("ACTIVE")
                .build();

        return itemRepository.save(item);
    }

    public Item updateItemStatus(Long id, String status, User user) {
        Item item = getItemById(id);

        // Check if user is owner or admin
        if (!item.getUser().getUserId().equals(user.getUserId()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Not authorized to update this item");
        }

        item.setStatus(status.toUpperCase());
        return itemRepository.save(item);
    }

    public void deleteItem(Long id, User user) {
        Item item = getItemById(id);

        if (!item.getUser().getUserId().equals(user.getUserId()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Not authorized to delete this item");
        }

        itemRepository.delete(item);
    }

    private String saveImage(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");
            Path targetLocation = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Could not store image. Error: " + e.getMessage());
        }
    }
}
