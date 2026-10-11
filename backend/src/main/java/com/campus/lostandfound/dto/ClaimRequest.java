package com.campus.lostandfound.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClaimRequest {
    @NotNull
    private Long itemId;

    private String proofDescription;
}
