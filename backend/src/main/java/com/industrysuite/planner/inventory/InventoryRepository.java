package com.industrysuite.planner.inventory;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    boolean existsBySkuIgnoreCase(String sku);
    boolean existsByCategoryId(Long categoryId);
}
