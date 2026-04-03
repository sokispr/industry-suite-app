package com.industrysuite.planner.events.dto;

import com.industrysuite.planner.events.EventStatus;
import com.industrysuite.planner.events.EventType;

import java.time.LocalDateTime;
import java.util.List;

public record EventResponse(
        Long id,
        String title,
        String description,
        String location,
        EventType eventType,
        EventStatus status,
        LocalDateTime startAt,
        LocalDateTime endAt,
        String colorHex,
        List<EventEquipmentRegisterResponse> equipmentRegisters
) {
}
