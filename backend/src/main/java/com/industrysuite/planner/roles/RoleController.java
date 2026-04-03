package com.industrysuite.planner.roles;

import com.industrysuite.planner.roles.dto.RoleCreateRequest;
import com.industrysuite.planner.roles.dto.RoleResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    public List<RoleResponse> listRoles() {
        return roleService.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoleResponse createRole(
            @Valid @RequestBody RoleCreateRequest request,
            @RequestHeader(value = "X-User-Role", defaultValue = "VIEWER") String userRole) {
        requireAdmin(userRole);
        return roleService.create(request);
    }

    @PutMapping("/{id}")
    public RoleResponse updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleCreateRequest request,
            @RequestHeader(value = "X-User-Role", defaultValue = "VIEWER") String userRole) {
        requireAdmin(userRole);
        return roleService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRole(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", defaultValue = "VIEWER") String userRole) {
        requireAdmin(userRole);
        roleService.delete(id);
    }

    private void requireAdmin(String userRole) {
        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only ADMIN can modify roles");
        }
    }
}
