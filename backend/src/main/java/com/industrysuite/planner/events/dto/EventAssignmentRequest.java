package com.industrysuite.planner.events.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record EventAssignmentRequest(
        @NotNull Long employeeId,
        @Size(max = 120) String dutyRole,
        @Size(max = 255) String notes,
        LocalDateTime shiftStartAt,
        LocalDateTime shiftEndAt
) {
}
