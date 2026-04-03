package com.industrysuite.planner.employees;

import com.industrysuite.planner.employees.dto.EmployeeResponse;
import com.industrysuite.planner.employees.dto.EmployeeUpsertRequest;
import com.industrysuite.planner.roles.Role;
import com.industrysuite.planner.roles.RoleRepository;
import com.industrysuite.planner.roles.dto.RoleResponse;
import com.industrysuite.planner.roles.dto.RoleCategoryResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@SuppressWarnings("null")
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;

    public EmployeeService(EmployeeRepository employeeRepository, RoleRepository roleRepository) {
        this.employeeRepository = employeeRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAll() {
        return employeeRepository.findAllByOrderByLastNameAscFirstNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        return toResponse(employee);
    }

    @Transactional
    public EmployeeResponse create(EmployeeUpsertRequest request) {
        validateEmailUniqueness(null, request.email());

        Employee employee = new Employee();
        applyRequest(employee, request);

        return toResponse(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeResponse update(Long id, EmployeeUpsertRequest request) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));

        validateEmailUniqueness(id, request.email());
        applyRequest(existing, request);

        return toResponse(employeeRepository.save(existing));
    }

    @Transactional
    public void delete(Long id) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        try {
            employeeRepository.delete(existing);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Employee cannot be deleted because it is used in event assignments");
        }
    }

    private void applyRequest(Employee employee, EmployeeUpsertRequest request) {
        employee.setFirstName(request.firstName().trim());
        employee.setLastName(request.lastName().trim());
        employee.setEmail(trimToNull(request.email()));
        employee.setPhone(trimToNull(request.phone()));
        employee.setActive(request.active() == null || request.active());
        employee.setRoles(resolveRoles(request.roleIds()));
    }

    private Set<Role> resolveRoles(List<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return new LinkedHashSet<>();
        }

        List<Role> roles = roleRepository.findAllById(roleIds)
                .stream()
                .sorted(Comparator.comparing(Role::getDisplayName))
                .toList();

        if (roles.size() != new LinkedHashSet<>(roleIds).size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more roleIds are invalid");
        }

        return new LinkedHashSet<>(roles);
    }

    private void validateEmailUniqueness(Long currentEmployeeId, String email) {
        String normalized = trimToNull(email);
        if (normalized == null) {
            return;
        }

        employeeRepository.findAllByOrderByLastNameAscFirstNameAsc()
                .stream()
                .filter(employee -> employee.getEmail() != null)
                .filter(employee -> employee.getEmail().equalsIgnoreCase(normalized))
                .filter(employee -> currentEmployeeId == null || !employee.getId().equals(currentEmployeeId))
                .findAny()
                .ifPresent(employee -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already used by another employee");
                });
    }

    private EmployeeResponse toResponse(Employee employee) {
        List<RoleResponse> roles = employee.getRoles()
                .stream()
                .sorted(Comparator.comparing((Role r) -> r.getCategory() != null ? r.getCategory().getName() : "").thenComparing(Role::getDisplayName))
                .map(role -> new RoleResponse(
                        role.getId(),
                        role.getCode(),
                        role.getDisplayName(),
                        role.getCategory() != null ? new RoleCategoryResponse(role.getCategory().getId(), role.getCategory().getName()) : null,
                        role.getColorHex(),
                        role.isSystemRole()))
                .toList();

        return new EmployeeResponse(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getFullName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.isActive(),
                roles);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
