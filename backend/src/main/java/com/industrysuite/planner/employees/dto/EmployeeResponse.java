package com.industrysuite.planner.employees.dto;

import com.industrysuite.planner.roles.dto.RoleResponse;

import java.util.List;

public record EmployeeResponse(
        Long id,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String phone,
        boolean active,
        List<RoleResponse> roles
) {
}
