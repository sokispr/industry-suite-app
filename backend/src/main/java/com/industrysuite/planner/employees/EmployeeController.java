package com.industrysuite.planner.employees;

import com.industrysuite.planner.employees.dto.EmployeeResponse;
import com.industrysuite.planner.employees.dto.EmployeeUpsertRequest;
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
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public List<EmployeeResponse> listEmployees() {
        return employeeService.getAll();
    }

    @GetMapping("/{id}")
    public EmployeeResponse getEmployee(@PathVariable Long id) {
        return employeeService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse createEmployee(
            @Valid @RequestBody EmployeeUpsertRequest request,
            @RequestHeader(value = "X-User-Role", defaultValue = "VIEWER") String userRole) {
        requireAdmin(userRole);
        return employeeService.create(request);
    }

    @PutMapping("/{id}")
    public EmployeeResponse updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeUpsertRequest request,
            @RequestHeader(value = "X-User-Role", defaultValue = "VIEWER") String userRole) {
        requireAdmin(userRole);
        return employeeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEmployee(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", defaultValue = "VIEWER") String userRole) {
        requireAdmin(userRole);
        employeeService.delete(id);
    }

    private void requireAdmin(String userRole) {
        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only ADMIN can modify employees");
        }
    }
}
