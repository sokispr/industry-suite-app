package com.industrysuite.planner.inventory.dto;

import com.industrysuite.planner.inventory.InventoryStatus;
import jakarta.validation.constraints.NotNull;

public record InventoryUpsertRequest(
        String sku,
        String name,
        Long categoryId,
        @NotNull(message = "Warehouse ID is required") Long warehouseId,
        Integer quantityTotal,
        Integer quantityReserved,
        InventoryStatus status) {
}
