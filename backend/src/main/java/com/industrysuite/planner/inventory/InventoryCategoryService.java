package com.industrysuite.planner.inventory;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
public class InventoryCategoryService {

    private final InventoryCategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;

    public InventoryCategoryService(InventoryCategoryRepository categoryRepository,
            InventoryRepository inventoryRepository) {
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional(readOnly = true)
    public List<InventoryCategory> getAll() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(InventoryCategory::getName))
                .toList();
    }

    @Transactional
    public InventoryCategory create(InventoryCategoryUpsertRequest request) {
        String normalizedName = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category name already exists");
        }
        InventoryCategory category = new InventoryCategory();
        category.setName(normalizedName);
        return categoryRepository.save(category);
    }

    @Transactional
    public InventoryCategory update(@NonNull Long id, InventoryCategoryUpsertRequest request) {
        InventoryCategory existing = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        String normalizedName = request.name().trim();
        categoryRepository.findByNameIgnoreCase(normalizedName)
                .filter(cat -> !cat.getId().equals(id))
                .ifPresent(cat -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Category name already exists");
                });

        existing.setName(normalizedName);
        return categoryRepository.save(existing);
    }

    @Transactional
    public void delete(@NonNull Long id) {
        if (inventoryRepository.existsByCategoryId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Category cannot be deleted because it is used by inventory items");
        }
        categoryRepository.deleteById(id);
    }
}
