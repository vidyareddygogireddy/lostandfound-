package com.campus.lostandfound.controller;

import com.campus.lostandfound.dto.ItemRequest;
import com.campus.lostandfound.entity.Item;
import com.campus.lostandfound.entity.User;
import com.campus.lostandfound.service.ItemService;
import com.campus.lostandfound.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Item>> getItems(
            @RequestParam(required = false) String itemType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        List<Item> items = itemService.getAllItems(itemType, category, location, search, status);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        Item item = itemService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    @GetMapping("/my-reports")
    public ResponseEntity<List<Item>> getMyReports() {
        User user = userService.getCurrentUser();
        List<Item> items = itemService.getItemsByUser(user);
        return ResponseEntity.ok(items);
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Item> createItemWithMultipart(
            @ModelAttribute ItemRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        User user = userService.getCurrentUser();
        Item createdItem = itemService.createItem(request, image, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
    }

    @PostMapping(consumes = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<Item> createItemWithJson(
            @RequestBody ItemRequest request
    ) {
        User user = userService.getCurrentUser();
        Item createdItem = itemService.createItem(request, null, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Item> updateItemStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        User user = userService.getCurrentUser();
        String status = body.get("status");
        Item updated = itemService.updateItemStatus(id, status, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteItem(@PathVariable Long id) {
        User user = userService.getCurrentUser();
        itemService.deleteItem(id, user);
        return ResponseEntity.ok(Map.of("message", "Item deleted successfully"));
    }
}
