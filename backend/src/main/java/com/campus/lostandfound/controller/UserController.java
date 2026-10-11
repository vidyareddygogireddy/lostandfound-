package com.campus.lostandfound.controller;

import com.campus.lostandfound.entity.User;
import com.campus.lostandfound.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(Map.of(
                "userId", user.getUserId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                "role", user.getRole(),
                "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
        ));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
