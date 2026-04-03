package com.industrysuite.planner.roles.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RoleCreateRequest(
        @NotBlank @Size(max = 40) String code,
        @NotBlank @Size(max = 120) String displayName,
        Long categoryId,
        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "must be valid hex color like #1f2937") String colorHex,
        boolean systemRole
) {
}
