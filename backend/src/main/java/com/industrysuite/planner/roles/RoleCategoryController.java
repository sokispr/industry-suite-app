package com.industrysuite.planner.roles;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles/categories")
public class RoleCategoryController {

    private final RoleCategoryService categoryService;

    public RoleCategoryController(RoleCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<RoleCategory> getAll() {
        return categoryService.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoleCategory create(@Valid @RequestBody RoleCategoryUpsertRequest request) {
        return categoryService.create(request);
    }

    @PutMapping("/{id}")
    public RoleCategory update(@PathVariable @NonNull Long id, @Valid @RequestBody RoleCategoryUpsertRequest request) {
        return categoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @NonNull Long id) {
        categoryService.delete(id);
    }
}
