package com.industrysuite.planner.inventory.dto;

import com.industrysuite.planner.inventory.InventoryStatus;
import com.industrysuite.planner.warehouses.dto.WarehouseResponse;

public record InventoryResponse(
                Long id,
                String sku,
                String name,
                InventoryCategoryResponse category,
                WarehouseResponse warehouse,
                Integer quantityTotal,
                Integer quantityReserved,
                Integer quantityAvailable,
                InventoryStatus status) {
}
