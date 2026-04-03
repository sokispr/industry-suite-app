package com.industrysuite.planner.events.dto;

public record EventEquipmentRegisterResponse(
        Long id,
        Long inventoryItemId,
        String inventorySku,
        String inventoryName,
        int quantityReserved,
        String notes
) {
}
