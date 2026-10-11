package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.AuthRequest;
import com.campus.lostandfound.dto.AuthResponse;
import com.campus.lostandfound.dto.RegisterRequest;
import com.campus.lostandfound.entity.User;
import com.campus.lostandfound.repository.UserRepository;
import com.campus.lostandfound.security.JwtUtils;
import com.campus.lostandfound.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthResponse authenticateUser(AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .build();
    }

    public User registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        String role = signUpRequest.getRole() != null && signUpRequest.getRole().equalsIgnoreCase("ADMIN") 
                ? "ADMIN" 
                : "STUDENT";

        User user = User.builder()
                .fullName(signUpRequest.getFullName())
                .email(signUpRequest.getEmail())
                .passwordHash(passwordEncoder.encode(signUpRequest.getPassword()))
                .phoneNumber(signUpRequest.getPhoneNumber())
                .role(role)
                .build();

        return userRepository.save(user);
    }
}
