package com.industrysuite.planner.employees.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record EmployeeUpsertRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String email,
        String phone,
        Boolean active,
        List<Long> roleIds) {
}
