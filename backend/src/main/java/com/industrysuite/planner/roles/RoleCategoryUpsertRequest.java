package com.industrysuite.planner.roles;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RoleCategoryUpsertRequest(
        @NotBlank(message = "Category name cannot be blank")
        @Size(max = 80, message = "Category name cannot exceed 80 characters") String name) {
}
