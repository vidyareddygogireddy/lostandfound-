package com.campus.lostandfound.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ItemRequest {
    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String itemType; // "LOST", "FOUND"

    @NotBlank
    private String category; // "ELECTRONICS", "ID_CARD", "BOOKS", "KEYS", "OTHER"

    @NotBlank
    private String location;

    private String dateReported; // "YYYY-MM-DD"
}
