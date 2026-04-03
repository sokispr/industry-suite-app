package com.industrysuite.planner.events.dto;

import com.industrysuite.planner.events.EventStatus;
import com.industrysuite.planner.events.EventType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public record EventUpsertRequest(
        @NotBlank @Size(max = 180) String title,
        String description,
        @Size(max = 140) String location,
        EventType eventType,
        EventStatus status,
        @NotNull LocalDateTime startAt,
        @NotNull LocalDateTime endAt,
        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "must be valid hex color like #1f2937") String colorHex,
        @Valid List<EventEquipmentRegisterRequest> equipmentRegisters
) {
}
