package com.industrysuite.planner.roles;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
public class RoleCategoryService {

    private final RoleCategoryRepository categoryRepository;
    private final RoleRepository roleRepository;

    public RoleCategoryService(RoleCategoryRepository categoryRepository, RoleRepository roleRepository) {
        this.categoryRepository = categoryRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public List<RoleCategory> getAll() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(RoleCategory::getName))
                .toList();
    }

    @Transactional
    public RoleCategory create(RoleCategoryUpsertRequest request) {
        String normalizedName = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category name already exists");
        }
        RoleCategory category = new RoleCategory();
        category.setName(normalizedName);
        return categoryRepository.save(category);
    }

    @Transactional
    public RoleCategory update(@NonNull Long id, RoleCategoryUpsertRequest request) {
        RoleCategory existing = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        existing.setName(request.name().trim());
        return categoryRepository.save(existing);
    }

    @Transactional
    public void delete(@NonNull Long id) {
        if (roleRepository.existsByCategoryId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Category cannot be deleted because it is used by roles");
        }
        categoryRepository.deleteById(id);
    }
}
