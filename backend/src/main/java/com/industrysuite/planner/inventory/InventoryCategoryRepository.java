package com.industrysuite.planner.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InventoryCategoryRepository extends JpaRepository<InventoryCategory, Long> {
    boolean existsByNameIgnoreCase(String name);
    Optional<InventoryCategory> findByNameIgnoreCase(String name);
}
