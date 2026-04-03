package com.industrysuite.planner.events.dto;

import java.time.LocalDateTime;

public record EventAssignmentResponse(
        Long id,
        Long employeeId,
        String employeeName,
        String dutyRole,
        String notes,
        LocalDateTime shiftStartAt,
        LocalDateTime shiftEndAt
) {
}
