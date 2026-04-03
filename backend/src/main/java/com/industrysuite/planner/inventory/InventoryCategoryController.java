package com.industrysuite.planner.inventory;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/categories")
public class InventoryCategoryController {

    private final InventoryCategoryService categoryService;

    public InventoryCategoryController(InventoryCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<InventoryCategory> getAll() {
        return categoryService.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InventoryCategory create(@Valid @RequestBody InventoryCategoryUpsertRequest request) {
        return categoryService.create(request);
    }

    @PutMapping("/{id}")
    public InventoryCategory update(@PathVariable @NonNull Long id, @Valid @RequestBody InventoryCategoryUpsertRequest request) {
        return categoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @NonNull Long id) {
        categoryService.delete(id);
    }
}
