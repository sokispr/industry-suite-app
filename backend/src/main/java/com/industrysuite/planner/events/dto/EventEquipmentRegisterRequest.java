package com.industrysuite.planner.events.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EventEquipmentRegisterRequest(
        @NotNull Long inventoryItemId,
        @NotNull @Min(1) Integer quantityReserved,
        @Size(max = 255) String notes
) {
}
