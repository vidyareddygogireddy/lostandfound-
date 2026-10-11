package com.campus.lostandfound.service;

import com.campus.lostandfound.entity.User;
import com.campus.lostandfound.repository.UserRepository;
import com.campus.lostandfound.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            throw new RuntimeException("No authenticated user found");
        }

        return userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
