package com.campus.lostandfound.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    private String phoneNumber;

    private String role; // "STUDENT" or "ADMIN" (default to STUDENT)
}
