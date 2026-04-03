package com.industrysuite.planner.roles.dto;

public record RoleResponse(
        Long id,
        String code,
        String displayName,
        RoleCategoryResponse category,
        String colorHex,
        boolean systemRole
) {
}
