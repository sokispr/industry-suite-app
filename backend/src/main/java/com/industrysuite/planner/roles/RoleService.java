package com.industrysuite.planner.roles;

import com.industrysuite.planner.roles.dto.RoleCreateRequest;
import com.industrysuite.planner.roles.dto.RoleResponse;
import com.industrysuite.planner.roles.dto.RoleCategoryResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
@SuppressWarnings("null")
public class RoleService {

    private static final String DEFAULT_COLOR = "#4f46e5";

    private final RoleRepository roleRepository;
    private final RoleCategoryRepository categoryRepository;

    public RoleService(RoleRepository roleRepository, RoleCategoryRepository categoryRepository) {
        this.roleRepository = roleRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> getAll() {
        return roleRepository.findAll()
                .stream()
                .sorted(Comparator.comparing((Role r) -> r.getCategory() != null ? r.getCategory().getName() : "").thenComparing(Role::getDisplayName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RoleResponse create(RoleCreateRequest request) {
        String normalizedCode = normalizeCode(request.code());
        if (roleRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Role code already exists");
        }

        Role role = new Role();
        role.setCode(normalizedCode);
        role.setDisplayName(request.displayName().trim());

        if (request.categoryId() != null) {
            RoleCategory category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category ID"));
            role.setCategory(category);
        }

        role.setColorHex(
                request.colorHex() == null || request.colorHex().isBlank() ? DEFAULT_COLOR : request.colorHex());
        role.setSystemRole(request.systemRole());

        return toResponse(roleRepository.save(role));
    }

    @Transactional
    public RoleResponse update(Long id, RoleCreateRequest request) {
        Role existing = roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));

        String normalizedCode = normalizeCode(request.code());
        roleRepository.findByCodeIgnoreCase(normalizedCode)
                .filter(role -> !role.getId().equals(id))
                .ifPresent(role -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Role code already exists");
                });

        existing.setCode(normalizedCode);
        existing.setDisplayName(request.displayName().trim());

        if (request.categoryId() != null) {
            RoleCategory category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category ID"));
            existing.setCategory(category);
        } else {
            existing.setCategory(null);
        }
        existing.setColorHex(
                request.colorHex() == null || request.colorHex().isBlank() ? DEFAULT_COLOR : request.colorHex());
        existing.setSystemRole(request.systemRole());

        return toResponse(roleRepository.save(existing));
    }

    @Transactional
    public void delete(Long id) {
        Role existing = roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));

        try {
            roleRepository.delete(existing);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Role cannot be deleted because it is still referenced");
        }
    }

    @Transactional(readOnly = true)
    public Role getByIdOrThrow(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase().replace(' ', '_');
    }

    private RoleResponse toResponse(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getCode(),
                role.getDisplayName(),
                role.getCategory() != null ? new RoleCategoryResponse(role.getCategory().getId(), role.getCategory().getName()) : null,
                role.getColorHex(),
                role.isSystemRole());
    }
}
