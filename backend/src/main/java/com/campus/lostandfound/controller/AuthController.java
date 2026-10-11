package com.campus.lostandfound.controller;

import com.campus.lostandfound.dto.AuthRequest;
import com.campus.lostandfound.dto.AuthResponse;
import com.campus.lostandfound.dto.RegisterRequest;
import com.campus.lostandfound.entity.User;
import com.campus.lostandfound.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest loginRequest) {
        AuthResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest signUpRequest) {
        try {
            User user = authService.registerUser(signUpRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "User registered successfully!",
                    "userId", user.getUserId(),
                    "email", user.getEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
